"use client";

const MainContent = ({selectedDua}) => {
  if (!selectedDua) {
    return (
      <div className="flex-1 px-6 py-8 max-w-3xl mx-auto flex items-center justify-center h-full"></div>
    );
  }

  return (
    <div className="flex-1 px-6 py-8 max-w-3xl mx-auto z-50">
      <div className="mb-7">
        <span className="block text-lg font-bold text-[#314331] mb-3">
          Translation
        </span>
        <div className="text-[#556e53] leading-7 max-w-2xl">
          {selectedDua.translation_en || "Translation not available"}
        </div>
        <div className="mt-4 text-xs text-[#7d917b]">
          Reference
          <br />
          {selectedDua.reference_en || "Reference not available"}
        </div>
      </div>

      <div className="rounded-lg bg-[#f7faf7] border border-[#e7efe4] px-8 pt-8 pb-6 mb-7">
        <div className="flex items-center text-[#678d67] mb-2 text-base font-semibold gap-2">
          <span>🌟</span>
          {selectedDua.id}. {selectedDua.name_en}
        </div>

        {/* Arabic Text */}
        {selectedDua.arabic && (
          <div className="font-serif text-2xl mb-3 text-right text-[#374c36] tracking-wide">
            {selectedDua.arabic}
          </div>
        )}

        {selectedDua.transliteration_en && (
          <div className="italic mb-4 text-[#787978]">
            {selectedDua.transliteration_en}
          </div>
        )}

        {selectedDua.audio && (
          <div className="mt-4">
            <audio controls className="w-full">
              <source src={selectedDua.audio} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
