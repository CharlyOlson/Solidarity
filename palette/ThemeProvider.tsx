/**
 * ThemeProvider component integrates the ColorPaletteProvider with
 * the application and provides dynamic theme support.
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { ColorPaletteProvider } from './ColorPaletteContext';
import { defaultPalette, Palette } from './colorPalette';

interface ThemeProviderProps {
  children: ReactNode;
  initialPalette?: Palette;
  systemDataSource?: {
    subscribe: (callback: (data: SystemMetricsData) => void) => () => void;
  };
}

interface SystemMetricsData {
  stability: number;
  transition: number;
  pressure: number;
}

/**
 * ThemeProvider integrates color palette with the application
 * and optionally connects to system metrics data sources
 */
export function ThemeProvider({
  children,
  initialPalette = defaultPalette,
  systemDataSource
}: ThemeProviderProps) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsData>({
    stability: 0.5,
    transition: 0.2,
    pressure: 0.0
  });

  // Subscribe to system data changes if source is provided
  useEffect(() => {
    if (!systemDataSource) return;

    // Subscribe to system metrics data
    const unsubscribe = systemDataSource.subscribe((data) => {
      setSystemMetrics(data);
    });

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [systemDataSource]);

  return (
    <ColorPaletteProvider initialPalette={initialPalette}>
      {React.Children.map(children, child => {
        // Pass system metrics to any component that accepts them
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child, {
            systemMetrics,
            ...child.props
          });
        }
        return child;
      })}
    </ColorPaletteProvider>
  );
}

export default ThemeProvider;