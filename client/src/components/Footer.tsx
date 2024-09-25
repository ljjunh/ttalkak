import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Privacy Policy
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              &copy; 2024 딸깍 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
