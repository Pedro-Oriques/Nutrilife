import { MdClose } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContexts";
export default function IconClose() {
  const { closeModal } = useAuth();
  return (
    <div className="absolute z-10 top-2 right-2">
      <MdClose
        onClick={closeModal}
        className="w-6 h-6 hover:opacity-65 transition duration-200 ease-in cursor-pointer"
      />
    </div>
  );
}
