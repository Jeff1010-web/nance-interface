import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function ScrollToBottom() {
  const [showTopButton, setShowTopButton] = useState(false);
  const [showBottomButton, setShowBottomButton] = useState(false);

  // Show the buttons when the user scrolls down 20px from the top of the document
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }

      // Show the "Jump to Bottom" button when the user scrolls to the bottom of the document
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setShowBottomButton(false);
      } else {
        setShowBottomButton(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // When the user clicks on the "Jump to Top" button, scroll to the top of the document
  const handleTopClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // When the user clicks on the "Jump to Bottom" button, scroll to the bottom of the document
  const handleBottomClick = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-0 z-50 opacity-50">
      {showTopButton && (
        <button
          className="md:h-15 md:w-15 fixed bottom-2 left-2 h-10 w-10 rounded-full border bg-white p-2 md:bottom-6 md:left-6"
          onClick={handleTopClick}
        >
          <ChevronUpIcon />
        </button>
      )}
      {showBottomButton && (
        <button
          className="md:h-15 md:w-15 fixed bottom-2 right-2 h-10 w-10 rounded-full border bg-white p-2 md:bottom-6 md:right-6"
          onClick={handleBottomClick}
        >
          <ChevronDownIcon />
        </button>
      )}
    </div>
  );
}
