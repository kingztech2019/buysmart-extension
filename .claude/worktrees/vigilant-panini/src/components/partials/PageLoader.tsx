import "./Loader.css";

interface LoadingData {
    msg: string;
     
  }
const PageLoader: React.FC<LoadingData> = ({msg}) => {
     
    return (
        <div id="overlay">
        <div className="text-center font-semibold text-lg" id="text">
          {msg}
        </div>
      </div>
    );
  };
  
  export default PageLoader;