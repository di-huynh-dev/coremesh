import Link from "next/link";
import { FiHome, FiHelpCircle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Decorative Alert Badge */}
      <div className="z-10 animate-fade-in">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold mb-6 tracking-wide uppercase shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Error 404
        </span>
      </div>

      {/* Big 404 Heading */}
      <h1 className="font-brand font-extrabold text-7xl md:text-9xl tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent z-10 select-none">
        404
      </h1>

      {/* Descriptive Title */}
      <h2 className="mt-4 text-xl md:text-2xl font-bold tracking-tight text-foreground font-brand z-10">
        Page Not Found
      </h2>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 z-10 w-full sm:w-auto">
        <Link href="/">
          <button className="group relative w-full sm:w-auto px-6 py-3.5 bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover border border-transparent font-semibold rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-xs flex items-center justify-center gap-2">
            <FiHome className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Go Back Home</span>
          </button>
        </Link>

        <Link href="/questions">
          <button className="w-full sm:w-auto px-6 py-3.5 bg-btn-secondary-bg border border-btn-secondary-border hover:border-foreground/30 text-btn-secondary-text hover:bg-foreground/5 font-semibold rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2">
            <FiHelpCircle className="w-4 h-4" />
            <span>Browse Questions</span>
          </button>
        </Link>
      </div>

      {/* Decorative Custom DOM Tree Graphic */}
      <div className="mt-16 opacity-10 dark:opacity-20 font-mono text-[10px] md:text-xs select-none max-w-lg overflow-hidden pointer-events-none border border-dashed border-card-border p-4 rounded-xl bg-card-bg/20">
        {`<html>`}
        <br />
        {`  <head><title>Reconciliation Failed</title></head>`}
        <br />
        {`  <body>`}
        <br />
        <span className="text-red-500 font-bold">{`    <!-- ERROR: Node not found in active tree -->`}</span>
        <br />
        <span className="text-red-500 font-bold">{`    <div id="reconciliation-error" status="404">`}</span>
        <br />
        {`      <p>Target route returned null. Cleanup scheduled...</p>`}
        <br />
        <span className="text-red-500 font-bold">{`    </div>`}</span>
        <br />
        {`  </body>`}
        {`</html>`}
      </div>
    </div>
  );
};

export default NotFound;
