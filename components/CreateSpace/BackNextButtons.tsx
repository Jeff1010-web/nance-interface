export default function BackNextButtons({ back, next, labelAsSkip = false }:
  { back?: () => void, next?: () => void, labelAsSkip?: boolean}) {

  return (
    <div className="flex justify-end space-x-6 mt-4">
      {back && <button
        className="inline-flex w-fit items-center justify-center rounded-md border border-transparent bg-gray-400 px-4 py-2 text-sm text-white shadow-sm hover:bg-gray-500"
        onClick={back}>Back</button>}
      {next && (
        <button
          className="inline-flex w-fit items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-indigo-500"
          onClick={() => next()}>
          {labelAsSkip ? "Skip" : "Next"}
        </button>
      )}
    </div>
  );
}
