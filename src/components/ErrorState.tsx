interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => (
  <p className="state-message error">Error: {message}</p>
);

export default ErrorState;
