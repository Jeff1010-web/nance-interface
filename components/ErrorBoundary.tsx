import React, {Component, PropsWithChildren} from "react";
import Custom500 from "../pages/500";

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<PropsWithChildren, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error("🔴 ErrorBoundary ->", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <Custom500 />
    }

    return this.props.children;
  }
}