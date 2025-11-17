import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-6">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    EV Warranty Management System
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Oops not found page!
                </p>
            </div>

            {/* 404 Box */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-10 text-center max-w-md w-full hover:shadow-md transition-all">
                <h2 className="text-8xl font-extrabold text-blue-600 mb-3">404</h2>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Page Not Found
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    The page you’re trying to access doesn’t exist or has been moved.
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium mx-auto"
                >
                    <ArrowLeftCircle size={18} />
                    Go Back
                </button>
            </div>

            {/* Footer */}
            <footer className="mt-12 text-sm text-gray-400">
                © {new Date().getFullYear()} EV Warranty Management System
            </footer>
        </div>
    );
};

export default NotFoundPage;
