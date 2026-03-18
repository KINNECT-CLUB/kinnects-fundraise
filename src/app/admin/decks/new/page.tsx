import { UploadDeckForm } from "./UploadDeckForm";

export default function NewDeckPage() {
  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload a deck</h1>
      <p className="text-sm text-gray-500 mb-8">
        Upload a PDF. We'll count the pages automatically and store the file securely.
      </p>
      <UploadDeckForm />
    </div>
  );
}
