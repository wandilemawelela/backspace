import React from 'react';
import { Alert, Snackbar } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            {this.state.error?.message || 'Something went wrong'}
          </Alert>
        </Snackbar>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 