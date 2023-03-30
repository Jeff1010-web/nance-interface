import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";

export default function JumpToTopOrBottom() {
  const [showTopButton, setShowTopButton] = useState(false);
  const [showBottomButton, setShowBottomButton] = useState(false);

  // Show the buttons when the user scrolls down 20px from the top of the document
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 20) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }

      // Show the "Jump to Bottom" button when the user scrolls to the bottom of the document
      if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
        setShowBottomButton(false);
      } else {
        setShowBottomButton(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // When the user clicks on the "Jump to Top" button, scroll to the top of the document
  const handleTopClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // When the user clicks on the "Jump to Bottom" button, scroll to the bottom of the document
  const handleBottomClick = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="z-50 fixed bottom-0 opacity-50">
      {showTopButton && (
        <button className="fixed bottom-2 left-2 h-10 w-10 md:bottom-6 md:left-6 md:h-15 md:w-15 rounded-full bg-white border" onClick={handleTopClick}>
          <ChevronUpIcon />
        </button>
      )}
      {showBottomButton && (
        <button className="fixed bottom-2 right-2 h-10 w-10 md:bottom-6 md:right-6 md:h-15 md:w-15 rounded-full bg-white border" onClick={handleBottomClick}>
          <ChevronDownIcon />
        </button>
      )}
    </div>
  );
}
