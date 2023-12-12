import React, { Component, PropsWithChildren } from "react";
import Custom500 from "../../pages/500";

interface State {
  hasError: boolean;
  error: any;
}

export default class ErrorBoundary extends Component<PropsWithChildren, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error("🔴 ErrorBoundary ->", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Custom500 errMsg={this.state.error?.message} />;
    }

    return this.props.children;
  }
}
