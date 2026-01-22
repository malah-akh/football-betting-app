import { X, FileEdit } from "lucide-react";

interface EditPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EditPickModal({
  isOpen,
  onClose,
  onConfirm,
}: EditPickModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3e4855]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] shadow-[0px_13px_36px_0px_rgba(80,82,113,0.3)] p-8 max-w-[340px] w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b99ac] hover:text-[#3e4855] transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-16 bg-[#f1f3f5] rounded-full flex items-center justify-center">
            <FileEdit className="size-8 text-[#3e4855]" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <p className="text-[14px] text-[#3e4855] leading-relaxed tracking-[-0.14px]">
            Would you like to update the stake value you added to this pick?
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onConfirm}
            className="bg-[#3e4855] text-white py-3 px-4 rounded-lg font-semibold text-[14px] hover:bg-[#2f3840] transition-colors"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="bg-[#bcc2c9] text-[#3e4855] py-3 px-4 rounded-lg font-semibold text-[14px] hover:bg-[#a8aeb5] transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}