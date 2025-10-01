/**
 * React Type Declarations
 * 
 * This file provides type declarations for React to fix TypeScript errors in the project.
 * It should be placed at the root of the palette folder to ensure all components have access
 * to these type definitions.
 */

declare module 'react' {
  // React core types
  export type ReactNode = 
    | React.ReactChild
    | React.ReactFragment
    | React.ReactPortal
    | boolean
    | null
    | undefined;
  
  export type ReactChild = React.ReactElement | string | number;
  
  export type ReactFragment = {} | React.ReactNodeArray;
  
  export type ReactNodeArray = Array<React.ReactNode>;
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  export type JSXElementConstructor<P> = (props: P) => ReactElement<any, any> | null;
  
  export type Key = string | number;
  
  export type Ref<T> = ((instance: T | null) => void) | React.RefObject<T> | null;
  
  export interface RefObject<T> {
    readonly current: T | null;
  }
  
  // React hooks
  export function createContext<T>(defaultValue: T): React.Context<T>;
  
  export interface Context<T> {
    Provider: React.Provider<T>;
    Consumer: React.Consumer<T>;
    displayName?: string;
  }
  
  export interface Provider<T> {
    $$typeof: symbol;
    props: {
      value: T;
      children?: ReactNode;
    };
  }
  
  export interface Consumer<T> {
    $$typeof: symbol;
    props: {
      children: (value: T) => ReactNode;
    };
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  
  export type SetStateAction<S> = S | ((prevState: S) => S);
  
  export type Dispatch<A> = (value: A) => void;
  
  export function useContext<T>(context: React.Context<T>): T;
  
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
  ): T;
  
  export function useEffect(
    effect: React.EffectCallback,
    deps?: React.DependencyList
  ): void;
  
  export type EffectCallback = () => void | (() => void);
  
  export type DependencyList = ReadonlyArray<any>;
  
  // React utility functions
  export const Children: {
    map<T, C>(
      children: C | C[],
      fn: (child: C, index: number) => T
    ): C extends null | undefined ? C : T[];
  };
  
  export function isValidElement<P>(object: any): object is React.ReactElement<P>;
  
  export function cloneElement<P, T extends React.Component<P, any>>(
    element: React.ReactElement<P>,
    props?: Partial<P> & React.Attributes,
    ...children: React.ReactNode[]
  ): React.ReactElement<P>;
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Make TypeScript happy with JSX
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}