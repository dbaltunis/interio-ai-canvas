
interface WindowFrameProps {
  windowType: string;
}

export const WindowFrame = ({ windowType }: WindowFrameProps) => {
  return (
    <div className="absolute top-28 left-16 right-16 bottom-20">
      <div className="w-full h-full border-4 border-gray-500 bg-white relative rounded-sm shadow-lg">
        {/* Window Panes */}
        <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-blue-50 border border-gray-300 rounded-sm"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
