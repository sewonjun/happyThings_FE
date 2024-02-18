interface ErrorMessageProp {
  message: string;
  handleRestart: () => void;
}

const ErrorMessage = ({ message, handleRestart }: ErrorMessageProp) => (
  <div className="flex flex-col justify-center items-center mt-10 h-auto w-6/12 m-auto bg-red-500">
    <h1 className="text-base text-gray-50 decoration-solid mb-1">
      Error: {message}
    </h1>
    <button
      onClick={handleRestart}
      type="button"
      className="text-gray-50 bg-black h-auto p-1 m-1"
    >
      Restart
    </button>
  </div>
);

export default ErrorMessage;
