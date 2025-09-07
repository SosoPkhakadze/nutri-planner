// src/components/Header.tsx
import NoSsr from './NoSsr'; // Import the wrapper
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-primary-deep-blue text-white p-4 flex justify-between items-center">
      <div className="font-bold text-xl">Nutri-Planner</div>
      <nav>
        <NoSsr> {/* Wrap the ThemeToggle */}
          <ThemeToggle />
        </NoSsr>
      </nav>
    </header>
  );
}