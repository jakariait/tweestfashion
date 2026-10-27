// import React from "react";
// import FeatureStore from "../../store/FeatureStore";
// import ImageComponent from "./ImageComponent.jsx";
// import Skeleton from "react-loading-skeleton";
//
// const Feature = () => {
//   const { FeatureStoreList, FeatureStoreListLoading, FeatureStoreListError } =
//     FeatureStore();
//
//   if (FeatureStoreListError) {
//     return (
//       <div className="primaryTextColor  container md:mx-auto text-center p-3">
//         <h1 className={"p-10"}>{FeatureStoreListError}</h1>
//       </div>
//     ); // Display error message
//   }
//   return (
//     <div className="xl:container xl:mx-auto pb-6 px-3">
//       <h2 className="sr-only">Our Features</h2>
//       {FeatureStoreListLoading ? (
//         <>
//           <div className={"grid grid-cols-2 md:grid-cols-4 gap-6 mb-6"}>
//             <Skeleton
//               height={100}
//               width={"100%"}
//               style={{ minHeight: "100px" }}
//               className="rounded-xl"
//             />
//             <Skeleton
//               height={100}
//               width={"100%"}
//               style={{ minHeight: "100px" }}
//               className="rounded-xl"
//             />
//             <Skeleton
//               height={100}
//               width={"100%"}
//               style={{ minHeight: "100px" }}
//               className="rounded-xl"
//             />
//             <Skeleton
//               height={100}
//               width={"100%"}
//               style={{ minHeight: "100px" }}
//               className="rounded-xl"
//             />
//           </div>
//         </>
//       ) : (
//         <>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {FeatureStoreList.map((feature) => (
//               <div
//                 key={feature._id}
//                 className="bg-white border border-gray-300 rounded-xl shadow-md py-3 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 min-h-[100px]"
//               >
//                 {/* Centering the Image */}
//                 <div className="flex justify-center items-center w-16 h-16">
//                   <ImageComponent
//                     imageName={feature.imgSrc}
//                     className="w-16 h-16 object-contain"
//                     altName={feature.title}
//                     skeletonHeight={64}
//                   />
//                 </div>
//                 {/* Title */}
//                 <h2 className="mt-6 text-gray-700 text-sm ">{feature.title}</h2>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };
//
// export default Feature;

import React from 'react';
import FeatureStore from '../../store/FeatureStore';
import ImageComponent from './ImageComponent.jsx';
import Skeleton from 'react-loading-skeleton';

const Feature = () => {
  const { FeatureStoreList, FeatureStoreListLoading, FeatureStoreListError } =
    FeatureStore();

  if (FeatureStoreListError) {
    return (
      <div className="primaryTextColor  container md:mx-auto text-center p-3">
        <h1 className={'p-10'}>{FeatureStoreListError}</h1>
      </div>
    ); // Display error message
  }
  return (
    <div className="xl:container xl:mx-auto  px-3 ">
      {FeatureStoreListLoading ? (
        <>
          <div className={'grid grid-cols-2 md:grid-cols-4 gap-6 mb-6'}>
            <Skeleton height={200} width={'100%'} />
            <Skeleton height={200} width={'100%'} />
            <Skeleton height={200} width={'100%'} />
            <Skeleton height={200} width={'100%'} />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 shadow-sm rounded-lg px-4 items-center justify-center">
            {FeatureStoreList.map((feature) => (
              <div
                key={feature._id}
                className=" rounded-xl  py-3 flex  items-center  text-center hover:-translate-y-1 transition-all duration-300"
              >
                {/* Centering the Image */}
                <div className="flex  gap-2 justify-center items-center">
                  <ImageComponent
                    imageName={feature.imgSrc}
                    className="w-10 h-10 object-contain"
                    altName={feature.title}
                  />
                  {/* Title */}
                  <h3 className=" text-gray-700  ">{feature.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Feature;
