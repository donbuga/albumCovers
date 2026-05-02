interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => <p className="mt-8 text-red-400">Error: {message}</p>;

export default ErrorState;
