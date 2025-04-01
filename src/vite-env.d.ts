
/// <reference types="vite/client" />

// This will be added to the existing file
import '@splidejs/react-splide';

declare module '@splidejs/react-splide' {
  interface Splide {
    mount(): void;
  }
  
  interface SplideOptions {
    type?: string;
    perPage?: number;
    perMove?: number;
    gap?: string | number;
    pagination?: boolean;
    arrows?: boolean;
    drag?: boolean;
    autoHeight?: boolean;
  }
}
