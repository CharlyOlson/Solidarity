#!/usr/bin/env python3
"""Tests for the opt-in analysis-only Coil measurement layer (generated cases only)."""

import math
import os
import sys
import unittest
from fractions import Fraction as F

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src'))
from analysis.coil_measurement import (  # noqa: E402
    CoilLayer, CoilLayerDisabled, CoilMeasurement, CoilValidationError, SACRED_NODES,
    first_order_ratio_covariance, first_order_valid, gaussian_after_scale, gaussian_pdf,
    integrate_density, nearest_node_offset, quarter_step_interpolation,
    sample_coil_uncertainty, to_fraction, transform_density)


def make(value='7/2', ref=7):
    return CoilLayer(True).measure('frequency', 'Hz', value, ref, 'declared:test')


class TestMeasurement(unittest.TestCase):
    def test_opt_in(self):
        with self.assertRaises(CoilLayerDisabled):
            CoilLayer().measure('frequency', 'Hz', 1, 1, 'x')
        self.assertFalse(CoilLayer.from_env({}).enabled)
        self.assertTrue(CoilLayer.from_env({CoilLayer.ENV_VAR: '1'}).enabled)

    def test_exact_value_and_float_exactness(self):
        self.assertEqual(make().coil, F(1, 2))
        self.assertEqual(to_fraction(0.5), F(1, 2))
        self.assertEqual(to_fraction('0.1'), F(1, 10))
        self.assertNotEqual(to_fraction(0.1), F(1, 10))  # binary float, exact but not 1/10
        for bad in (float('nan'), float('inf'), True, 'abc'):
            with self.assertRaises(CoilValidationError):
                to_fraction(bad)

    def test_rebase_vs_scale_are_different(self):
        m = make()
        r = m.rebase(2)
        self.assertEqual(r.value, m.value)
        self.assertEqual(r.reference_value, 49 * m.reference_value)
        self.assertEqual(r.coil, m.coil / 49)
        s = m.scale_quantity(49)
        self.assertEqual(s.reference_value, m.reference_value)
        self.assertEqual(s.coil, m.coil * 49)
        self.assertNotEqual(r.coil, s.coil)
        self.assertEqual(m.rebase(3).rebase(-3).coil, m.coil)
        self.assertEqual(m.rebase(-1).coil, m.coil * 7)

    def test_exact_scale_invariance(self):
        m = make('440.5', 220)
        k = m.convert_unit(F(1, 1000), 'kHz')
        self.assertEqual(k.coil, m.coil)
        self.assertEqual(k.native_unit, 'kHz')

    def test_bounds_and_validation(self):
        m = make()
        for bad in (65, -65):
            with self.assertRaises(CoilValidationError):
                m.rebase(bad)
        with self.assertRaises(CoilValidationError):
            m.rebase(1.5)
        with self.assertRaises(CoilValidationError):
            m.scale_quantity(0)
        with self.assertRaises(CoilValidationError):
            CoilLayer(True).measure('frequency', 'Hz', 1, 0, 'x')
        with self.assertRaises(CoilValidationError):
            CoilLayer(True).measure('frequency', 'Hz', 1, 1, ' ')

    def test_financial_quantities_rejected(self):
        layer = CoilLayer(True)
        for kind, unit in (('payment', 'Hz'), ('ledger', 'x'), ('frequency', 'USD'),
                           ('frequency', 'COIL'), ('token', 'wei'), ('amount', 'u')):
            with self.assertRaises(CoilValidationError, msg=(kind, unit)):
                layer.measure(kind, unit, 1, 1, 'x')

    def test_serialization_roundtrip(self):
        m = make('1/3', 7).rebase(1)
        d = m.to_dict()
        self.assertTrue(d['analysis_only'])
        self.assertFalse(d['financial'])
        self.assertEqual(d['reference']['provenance'], 'declared:test')
        self.assertEqual(d['derivation'], ['rebase_reference:7^1'])
        m2 = CoilMeasurement.from_json(m.to_json())
        self.assertEqual(m2, m)
        self.assertEqual(m2.coil, F(1, 147))
        d['coil']['exact'] = '1/2'
        with self.assertRaises(CoilValidationError):
            CoilMeasurement.from_dict(d)


class TestUncertainty(unittest.TestCase):
    def test_single_ratio_matches_closed_form(self):
        q, r, sq, sr, rho = 3.0, 2.0, 0.1, 0.05, 0.4
        cov = [[sq**2, rho*sq*sr], [rho*sq*sr, sr**2]]
        c, cc = first_order_ratio_covariance([q], [r], cov)
        expect = (sq/r)**2 + (q*sr/r**2)**2 - 2*(1/r)*(q/r**2)*rho*sq*sr
        self.assertAlmostEqual(c[0], 1.5)
        self.assertAlmostEqual(cc[0, 0], expect, places=14)

    def test_shared_reference_creates_dependence(self):
        q, r, sr = [2.0, 6.0], [4.0], 0.2
        cov = np.diag([0.01, 0.01, sr**2])
        _, cc = first_order_ratio_covariance(q, r, cov)
        self.assertAlmostEqual(cc[0, 1], q[0]*q[1]*sr**2/r[0]**4, places=14)
        self.assertGreater(cc[0, 1], 0)
        # independent references with same sigmas: no off-diagonal
        _, ci = first_order_ratio_covariance(q, [4.0, 4.0], np.diag([0.01, 0.01, sr**2, sr**2]))
        self.assertEqual(ci[0, 1], 0.0)
        np.testing.assert_allclose(np.diag(cc), np.diag(ci))

    def test_rebase_scales_sigma_not_relative_uncertainty(self):
        q, r, sq, sr = 5.0, 3.0, 0.2, 0.1
        c0, cc0 = first_order_ratio_covariance([q], [r], np.diag([sq**2, sr**2]))
        k = 7**3
        c1, cc1 = first_order_ratio_covariance([q], [k*r], np.diag([sq**2, (k*sr)**2]))
        self.assertAlmostEqual(c1[0], c0[0]/k, places=15)
        self.assertAlmostEqual(math.sqrt(cc1[0, 0])/c1[0], math.sqrt(cc0[0, 0])/c0[0], places=12)
        self.assertAlmostEqual(math.sqrt(cc1[0, 0]), math.sqrt(cc0[0, 0])/k, places=15)

    def test_unit_change_invariance_with_correlated_inputs(self):
        cov = [[0.04, 0.01], [0.01, 0.09]]
        _, a = first_order_ratio_covariance([10.0], [4.0], cov)
        k = 1e-3
        cov_k = [[0.04*k*k, 0.01*k*k], [0.01*k*k, 0.09*k*k]]
        _, b = first_order_ratio_covariance([10.0*k], [4.0*k], cov_k)
        self.assertAlmostEqual(a[0, 0], b[0, 0], places=12)

    def test_first_order_agrees_with_sampling_when_small(self):
        q, r = 10.0, 5.0
        cov = [[0.04, 0.005], [0.005, 0.01]]
        _, cc = first_order_ratio_covariance([q], [r], cov)
        s = sample_coil_uncertainty(q, r, cov, n_samples=200000, seed=1)
        self.assertLess(abs(s['std'] - math.sqrt(cc[0, 0])) / s['std'], 0.02)
        self.assertTrue(first_order_valid(0.1, 5.0))
        self.assertFalse(first_order_valid(2.0, 5.0))

    def test_bad_covariance_rejected(self):
        for cov in ([[1, 0], [0, -1]], [[1, 2], [0, 1]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]):
            with self.assertRaises(CoilValidationError):
                first_order_ratio_covariance([1.0], [1.0], cov)


class TestGaussianDensity(unittest.TestCase):
    def test_transform_matches_closed_form_and_normalises(self):
        mu, sigma = 3.5, 0.4
        for s in (1, 7, 49, F(1, 2), 343):
            p = transform_density(gaussian_pdf(mu, sigma), s)
            m2, s2 = gaussian_after_scale(mu, sigma, s)
            ref = gaussian_pdf(m2, s2)
            for c in np.linspace(m2 - 3*s2, m2 + 3*s2, 7):
                self.assertAlmostEqual(p(c), ref(c), delta=1e-12 * max(1, ref(c)))
            self.assertAlmostEqual(integrate_density(p, m2 - 10*s2, m2 + 10*s2), 1.0, places=9)

    def test_matches_empirical_samples(self):
        rng = np.random.default_rng(7)
        x = rng.normal(3.5, 0.4, 400000) / 7
        h, edges = np.histogram(x, bins=40, density=True)
        p = transform_density(gaussian_pdf(3.5, 0.4), 7)
        mid = (edges[:-1] + edges[1:]) / 2
        self.assertLess(max(abs(h[i] - p(mid[i])) for i in range(40)) / p(0.5), 0.05)

    def test_bad_scale(self):
        for s in (0, -1, float('nan')):
            with self.assertRaises(CoilValidationError):
                transform_density(gaussian_pdf(0, 1), s)


class TestSampling(unittest.TestCase):
    cov = [[0.01, 0], [0, 0.0025]]

    def test_seed_reproducible(self):
        a = sample_coil_uncertainty(7, 2, self.cov, n_samples=2000, seed=5, snap_nodes=SACRED_NODES)
        b = sample_coil_uncertainty(7, 2, self.cov, n_samples=2000, seed=5, snap_nodes=SACRED_NODES)
        self.assertEqual(a, b)
        c = sample_coil_uncertainty(7, 2, self.cov, n_samples=2000, seed=6)
        self.assertNotEqual(a['mean'], c['mean'])

    def test_data_dependent_scale_differs_from_fixed_formula(self):
        # s = |q_draw|/7 is correlated with C, so C/s = 7/r: the fixed-s closed form no longer applies.
        fixed = sample_coil_uncertainty(7, 2, self.cov, n_samples=20000, seed=3,
                                        scale_fn=lambda q, r: 7.0)
        dep = sample_coil_uncertainty(7, 2, self.cov, n_samples=20000, seed=3,
                                      scale_fn=lambda q, r: abs(q) / 7.0)
        _, cc = first_order_ratio_covariance([7], [2], self.cov)
        self.assertAlmostEqual(fixed['std'], math.sqrt(cc[0, 0]) / 7, delta=0.03 * fixed['std'])
        self.assertAlmostEqual(dep['std'], 7 * 0.05 / 4, delta=0.1 * dep['std'])
        self.assertGreater(dep['std'] / fixed['std'], 3)

    def test_snapping_and_rejection_accounting(self):
        s = sample_coil_uncertainty(7, 1, [[0.01, 0], [0, 0.25]], n_samples=5000, seed=2,
                                    snap_nodes=SACRED_NODES)
        self.assertEqual(s['n_used'] + s['n_rejected'], 5000)
        self.assertAlmostEqual(sum(s['snap_fractions'].values()), 1.0)
        self.assertEqual(nearest_node_offset(5.5), (4.0, 1.5))      # tie -> lower
        self.assertEqual(nearest_node_offset(8.0), (7.0, 1.0))
        with self.assertRaises(CoilValidationError):
            sample_coil_uncertainty(1, 1, self.cov, n_samples=0, seed=0)


class TestQuarterStep(unittest.TestCase):
    def test_rule_is_experimental_and_not_canonical(self):
        d = quarter_step_interpolation(7)
        self.assertEqual(d['status'], 'experimental')
        self.assertEqual(d['values'], ['7/1', '35/4', '21/2', '49/4', '14/1'])
        in_nodes = [v for v in d['approx'] if v in SACRED_NODES]
        self.assertEqual(in_nodes, [7.0, 14.0])
        with self.assertRaises(CoilValidationError):
            quarter_step_interpolation(0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
