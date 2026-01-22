import { Check, X } from "lucide-react";

interface PickConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  suggestedAmount?: string;
}

export function PickConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  suggestedAmount = "€16.75",
}: PickConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#64748b]/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.2)] w-[280px] p-6 mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8b99ac] hover:text-[#3e4855] transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Checkmark icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-white border-2 border-[#3e4855] rounded-full p-2">
            <Check className="size-6 text-[#3e4855]" strokeWidth={3} />
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-[#3e4855] text-[14px] font-medium leading-[1.4] mb-6 tracking-[-0.28px]">
          Would you like to add this pick with a suggested amount of{" "}
          <span className="font-semibold">{suggestedAmount}</span> to your picks
          list?
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#3e4855] text-white py-2.5 px-4 rounded-lg font-semibold text-[14px] hover:bg-[#2f3840] transition-colors"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#bcc2c9] text-[#3e4855] py-2.5 px-4 rounded-lg font-semibold text-[14px] hover:bg-[#a8aeb5] transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}