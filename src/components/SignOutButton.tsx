// src/components/SignOutButton.tsx
export default function SignOutButton() {
    return (
        <form action="/auth/signout" method="post">
            <button 
            type="submit" 
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors duration-200"
            >
            Sign Out
            </button>
        </form>
    );
}