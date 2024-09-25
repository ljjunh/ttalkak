import Button from "@/components/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className="mb-6 text-center text-lg">{message}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onClose} label="취소" size="large" />
          <Button onClick={onConfirm} label="삭제" primary size="large" />
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
