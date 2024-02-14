type Emotion = "unhappy" | "happy" | "neutral" | null;

interface EmotionIndicatorProp {
  emotion: Emotion;
}

function EmotionIndicator({ emotion }: EmotionIndicatorProp) {
  return (
    <div className="flex grow-0 flex-row h-auto w-auto bg-stone-200 border-2 border-stone-900 ring-offset-0 p-2 m-1  rounded-3xl justify-around">
      <div
        className={`text-4xl p-3 m-2 ${
          emotion === "unhappy" ? "bg-red-600 " : "bg-stone-300"
        } rounded-full border-4 border-stone-900 shadow-md`}
      >
        🙁
      </div>
      <div
        className={`text-4xl p-3 m-2 ${
          emotion === "neutral" ? "bg-yellow-400 shadow-md" : "bg-stone-300"
        } rounded-full border-4 border-stone-900 shadow-md`}
      >
        😐
      </div>
      <div
        className={`text-4xl p-3 m-2 ${
          emotion === "happy" ? "bg-lime-400" : "bg-stone-300"
        } rounded-full border-4 border-stone-900 stone-md`}
      >
        🙂
      </div>
    </div>
  );
}

export default EmotionIndicator;
