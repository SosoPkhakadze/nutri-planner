// src/components/SignOutButton.tsx

// Define props for the component
interface SignOutButtonProps {
    className?: string;
    children?: React.ReactNode;
  }
  
  export default function SignOutButton({ className, children }: SignOutButtonProps) {
      // Define a default style that can be overridden by the className prop
      const defaultClassName = "px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors duration-200";
      
      return (
          <form action="/auth/signout" method="post" className={children ? '' : 'w-full'}>
              <button 
                  type="submit" 
                  // If a className is provided, use it. Otherwise, use the default.
                  className={className || defaultClassName}
              >
                  {/* If children are provided, render them, otherwise default to "Sign Out" */}
                  {children || 'Sign Out'}
              </button>
          </form>
      );
  }