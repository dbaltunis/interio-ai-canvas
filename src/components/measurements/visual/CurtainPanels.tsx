
interface CurtainPanelsProps {
  curtainType: string;
  curtainSide: string;
  hardwareType: string;
  poolingOption: string;
  poolingAmount: string;
}

export const CurtainPanels = ({ 
  curtainType, 
  curtainSide, 
  hardwareType, 
  poolingOption, 
  poolingAmount 
}: CurtainPanelsProps) => {
  const hasValue = (value: any) => value && value !== "" && value !== "0" && parseFloat(value) > 0;
  
  const getCurtainBottomPosition = () => {
    if (poolingOption === "touching_floor") {
      return "bottom-8";
    } else if (poolingOption === "below_floor" && hasValue(poolingAmount)) {
      return "bottom-4";
    } else {
      return "bottom-16";
    }
  };

  const curtainTopPosition = hardwareType === "track" ? "top-14" : "top-18";

  const curtainFolds = (
    <>
      <div className="absolute top-1 bottom-1 left-1 w-0.5 bg-red-800 opacity-60"></div>
      <div className="absolute top-1 bottom-1 left-2.5 w-0.5 bg-red-700 opacity-50"></div>
      <div className="absolute top-1 bottom-1 left-4 w-0.5 bg-red-600 opacity-40"></div>
      <div className="absolute top-1 bottom-1 left-5.5 w-0.5 bg-red-500 opacity-30"></div>
      <div className="absolute top-1 bottom-1 left-7 w-0.5 bg-red-400 opacity-25"></div>
    </>
  );

  const poolingEffect = poolingOption === "below_floor" && hasValue(poolingAmount) && (
    <div className="absolute -bottom-6 left-0 w-full h-6 bg-gradient-to-b from-red-500 to-red-400 opacity-70 rounded-b-lg shadow-lg"></div>
  );

  return (
    <>
      {curtainType === "pair" ? (
        <>
          {/* Left Panel */}
          <div className={`absolute ${curtainTopPosition} left-18 w-8 ${getCurtainBottomPosition()} bg-gradient-to-r from-red-600 to-red-500 opacity-85 rounded-sm shadow-xl`}>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
            {curtainFolds}
            {poolingEffect}
          </div>
          
          {/* Right Panel */}
          <div className={`absolute ${curtainTopPosition} right-18 w-8 ${getCurtainBottomPosition()} bg-gradient-to-r from-red-600 to-red-500 opacity-85 rounded-sm shadow-xl`}>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
            {curtainFolds}
            {poolingEffect}
          </div>
        </>
      ) : (
        /* Single Panel */
        <div className={`absolute ${curtainTopPosition} ${curtainSide === "left" ? "left-18" : "right-18"} w-12 ${getCurtainBottomPosition()} bg-gradient-to-r from-red-600 to-red-500 opacity-85 rounded-sm shadow-xl`}>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
          {curtainFolds}
          <div className="absolute top-1 bottom-1 left-8 w-0.5 bg-red-200 opacity-15"></div>
          <div className="absolute top-1 bottom-1 left-9.5 w-0.5 bg-red-100 opacity-10"></div>
          {poolingEffect}
        </div>
      )}
    </>
  );
};
