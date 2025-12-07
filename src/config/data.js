export const data = {
  models: {
    Sofa: { 
      // The lods array length and thresholds array length should be same 
      lods: [
        { level: 0, modelPath: "/models/Sofa-LOD-0.glb" }, // Highest
        { level: 1, modelPath: "/models/Sofa-LOD-1.glb" },
        { level: 2, modelPath: "/models/Sofa-LOD-2.glb" }, // Default
        // Add 50 more later — no change needed in React code
      ],
      thresholds: [0.7, 1.2, 1.5], // Should be in increasing order
      // scale: [2,2,2],
      // position:[3,3,3],
      // rotation:[0,-90,0],
      sofaMeshCategories:{
        ["Fabric Material"]:["Support","Backrsupport001","Seat001","Seat","Backrest001","Armrest","Backrest","Armrest001","Backrsupport"],
        ["Sofa Leg Type"]:["leg001","leg004","leg003","leg","leg002","leg005"],
        ["Cushion Type"]:["Pillow"],
        ["Cushion Type2"]:["Pillow002"],
        ["Cushion Type3"]:["Pillow001"],
        ["Towel Material"]:["Towel"]
      },
      materialsLods: [
        {
          id: "0",
          materialName: "Comfort Foam",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Comfort Foam/LOD-0/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-0/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-0/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-0/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Comfort Foam/LOD-1/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-1/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-1/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-1/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Comfort Foam/LOD-2/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-2/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-2/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-2/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type"],
            materialImagePath: "/images/Green.png",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "1",
          materialName: "Feather Touch",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Feather Touch/LOD-0/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-0/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-0/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-0/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Feather Touch/LOD-1/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-1/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-1/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-1/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Feather Touch/LOD-2/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-2/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-2/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-2/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type"],
            materialImagePath: "/images/Red.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "2",
          materialName: "Memory Cloud",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Memory Cloud/LOD-0/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-0/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-0/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-0/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Memory Cloud/LOD-1/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-1/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-1/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-1/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Memory Cloud/LOD-2/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-2/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-2/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-2/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type"],
            materialImagePath: "/images/Black.jfif",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "3",
          materialName: "Premium Leather",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Premium Leather/LOD-0/Base_Color.png",
              // normalPath: "/textures/Premium Leather/LOD-0/Normal.png",
              // roughnessPath: "/textures/Premium Leather/LOD-0/Roughness.png",
              // metallicPath: "/textures/Premium Leather/LOD-0/Metallic.png",
              // displacementPath:"/textures/Premium Leather/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Premium Leather/LOD-1/Base_Color.png",
              // normalPath: "/textures/Premium Leather/LOD-1/Normal.png",
              // roughnessPath: "/textures/Premium Leather/LOD-1/Roughness.png",
              // metallicPath: "/textures/Premium Leather/LOD-1/Metallic.png",
              // displacementPath:"/textures/Premium Leather/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Premium Leather/LOD-2/Base_Color.png",
              // normalPath: "/textures/Premium Leather/LOD-2/Normal.png",
              // roughnessPath: "/textures/Premium Leather/LOD-2/Roughness.png",
              // metallicPath: "/textures/Premium Leather/LOD-2/Metallic.png",
              // displacementPath:"/textures/Premium Leather/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Fabric Material"],
            materialImagePath: "/images/Brown.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "4",
          materialName: "Soft Fabric",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Soft Fabric/LOD-0/Base_Color.png",
              // normalPath: "/textures/Soft Fabric/LOD-0/Normal.png",
              // roughnessPath: "/textures/Soft Fabric/LOD-0/Roughness.png",
              // metallicPath: "/textures/Soft Fabric/LOD-0/Metallic.png",
              // displacementPath:"/textures/Soft Fabric/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Soft Fabric/LOD-1/Base_Color.png",
              // normalPath: "/textures/Soft Fabric/LOD-1/Normal.png",
              // roughnessPath: "/textures/Soft Fabric/LOD-1/Roughness.png",
              // metallicPath: "/textures/Soft Fabric/LOD-1/Metallic.png",
              // displacementPath:"/textures/Soft Fabric/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Soft Fabric/LOD-2/Base_Color.png",
              // normalPath: "/textures/Soft Fabric/LOD-2/Normal.png",
              // roughnessPath: "/textures/Soft Fabric/LOD-2/Roughness.png",
              // metallicPath: "/textures/Soft Fabric/LOD-2/Metallic.png",
              // displacementPath:"/textures/Soft Fabric/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Fabric Material"],
            materialImagePath: "/images/LightPink.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "5",
          materialName: "Royal Velvet",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Royal Velvet/LOD-0/Base_Color.png",
              // normalPath: "/textures/Royal Velvet/LOD-0/Normal.png",
              // roughnessPath: "/textures/Royal Velvet/LOD-0/Roughness.png",
              // metallicPath: "/textures/Royal Velvet/LOD-0/Metallic.png",
              // displacementPath:"/textures/Royal Velvet/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Royal Velvet/LOD-1/Base_Color.png",
              // normalPath: "/textures/Royal Velvet/LOD-1/Normal.png",
              // roughnessPath: "/textures/Royal Velvet/LOD-1/Roughness.png",
              // metallicPath: "/textures/Royal Velvet/LOD-1/Metallic.png",
              // displacementPath:"/textures/Royal Velvet/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Royal Velvet/LOD-2/Base_Color.png",
              // normalPath: "/textures/Royal Velvet/LOD-2/Normal.png",
              // roughnessPath: "/textures/Royal Velvet/LOD-2/Roughness.png",
              // metallicPath: "/textures/Royal Velvet/LOD-2/Metallic.png",
              // displacementPath:"/textures/Royal Velvet/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Fabric Material"],
            materialImagePath: "/images/Pink.webp",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "6",
          materialName: "Modern Steel",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Modern Steel/LOD-0/Base_Color.png",
              // normalPath: "/textures/Modern Steel/LOD-0/Normal.png",
              // roughnessPath: "/textures/Modern Steel/LOD-0/Roughness.png",
              // metallicPath: "/textures/Modern Steel/LOD-0/Metallic.png",
              // displacementPath:"/textures/Modern Steel/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Modern Steel/LOD-1/Base_Color.png",
              // normalPath: "/textures/Modern Steel/LOD-1/Normal.png",
              // roughnessPath: "/textures/Modern Steel/LOD-1/Roughness.png",
              // metallicPath: "/textures/Modern Steel/LOD-1/Metallic.png",
              // displacementPath:"/textures/Modern Steel/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Modern Steel/LOD-2/Base_Color.png",
              // normalPath: "/textures/Modern Steel/LOD-2/Normal.png",
              // roughnessPath: "/textures/Modern Steel/LOD-2/Roughness.png",
              // metallicPath: "/textures/Modern Steel/LOD-2/Metallic.png",
              // displacementPath:"/textures/Modern Steel/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Sofa Leg Type"],
            materialImagePath: "/images/Purple.avif",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "7",
          materialName: "Wooden Classic",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Wooden Classic/LOD-0/Base_Color.png",
              // normalPath: "/textures/Wooden Classic/LOD-0/Normal.png",
              // roughnessPath: "/textures/Wooden Classic/LOD-0/Roughness.png",
              // metallicPath: "/textures/Wooden Classic/LOD-0/Metallic.png",
              // displacementPath:"/textures/Wooden Classic/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Wooden Classic/LOD-1/Base_Color.png",
              // normalPath: "/textures/Wooden Classic/LOD-1/Normal.png",
              // roughnessPath: "/textures/Wooden Classic/LOD-1/Roughness.png",
              // metallicPath: "/textures/Wooden Classic/LOD-1/Metallic.png",
              // displacementPath:"/textures/Wooden Classic/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Wooden Classic/LOD-2/Base_Color.png",
              // normalPath: "/textures/Wooden Classic/LOD-2/Normal.png",
              // roughnessPath: "/textures/Wooden Classic/LOD-2/Roughness.png",
              // metallicPath: "/textures/Wooden Classic/LOD-2/Metallic.png",
              // displacementPath:"/textures/Wooden Classic/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Sofa Leg Type"],
            materialImagePath: "/images/LightGray.avif",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "8",
          materialName: "Black Metal",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Black Metal/LOD-0/Base_Color.png",
              // normalPath: "/textures/Black Metal/LOD-0/Normal.png",
              // roughnessPath: "/textures/Black Metal/LOD-0/Roughness.png",
              // metallicPath: "/textures/Black Metal/LOD-0/Metallic.png",
              // displacementPath:"/textures/Black Metal/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Black Metal/LOD-1/Base_Color.png",
              // normalPath: "/textures/Black Metal/LOD-1/Normal.png",
              // roughnessPath: "/textures/Black Metal/LOD-1/Roughness.png",
              // metallicPath: "/textures/Black Metal/LOD-1/Metallic.png",
              // displacementPath:"/textures/Black Metal/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Black Metal/LOD-2/Base_Color.png",
              // normalPath: "/textures/Black Metal/LOD-2/Normal.png",
              // roughnessPath: "/textures/Black Metal/LOD-2/Roughness.png",
              // metallicPath: "/textures/Black Metal/LOD-2/Metallic.png",
              // displacementPath:"/textures/Black Metal/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Sofa Leg Type"],
            materialImagePath: "/images/Yellow.jpeg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },

        {
          id: "9",
          materialName: "Comfort Foam",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Comfort Foam/LOD-0/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-0/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-0/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-0/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Comfort Foam/LOD-1/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-1/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-1/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-1/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Comfort Foam/LOD-2/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-2/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-2/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-2/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type2"],
            materialImagePath: "/images/Green.png",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "10",
          materialName: "Feather Touch",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Feather Touch/LOD-0/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-0/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-0/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-0/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Feather Touch/LOD-1/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-1/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-1/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-1/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Feather Touch/LOD-2/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-2/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-2/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-2/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type2"],
            materialImagePath: "/images/LightPink.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "11",
          materialName: "Memory Cloud",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Memory Cloud/LOD-0/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-0/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-0/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-0/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Memory Cloud/LOD-1/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-1/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-1/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-1/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Memory Cloud/LOD-2/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-2/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-2/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-2/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type2"],
            materialImagePath: "/images/Black.jfif",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },

        {
          id: "12",
          materialName: "Comfort Foam",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Comfort Foam/LOD-0/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-0/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-0/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-0/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Comfort Foam/LOD-1/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-1/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-1/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-1/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Comfort Foam/LOD-2/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-2/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-2/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-2/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type3"],
            materialImagePath: "/images/Brown.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "13",
          materialName: "Feather Touch",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Feather Touch/LOD-0/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-0/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-0/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-0/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Feather Touch/LOD-1/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-1/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-1/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-1/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Feather Touch/LOD-2/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-2/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-2/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-2/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type3"],
            materialImagePath: "/images/Red.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "14",
          materialName: "Memory Cloud",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Memory Cloud/LOD-0/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-0/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-0/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-0/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Memory Cloud/LOD-1/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-1/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-1/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-1/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Memory Cloud/LOD-2/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-2/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-2/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-2/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Cushion Type3"],
            materialImagePath: "/images/Black.jfif",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },

        {
          id: "15",
          materialName: "Comfort Foam",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Comfort Foam/LOD-0/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-0/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-0/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-0/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Comfort Foam/LOD-1/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-1/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-1/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-1/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Comfort Foam/LOD-2/Base_Color.png",
              // normalPath: "/textures/Comfort Foam/LOD-2/Normal.png",
              // roughnessPath: "/textures/Comfort Foam/LOD-2/Roughness.png",
              // metallicPath: "/textures/Comfort Foam/LOD-2/Metallic.png",
              // displacementPath:"/textures/Comfort Foam/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Towel Material"],
            materialImagePath: "/images/Red.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "16",
          materialName: "Feather Touch",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Feather Touch/LOD-0/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-0/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-0/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-0/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Feather Touch/LOD-1/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-1/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-1/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-1/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Feather Touch/LOD-2/Base_Color.png",
              // normalPath: "/textures/Feather Touch/LOD-2/Normal.png",
              // roughnessPath: "/textures/Feather Touch/LOD-2/Roughness.png",
              // metallicPath: "/textures/Feather Touch/LOD-2/Metallic.png",
              // displacementPath:"/textures/Feather Touch/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Towel Material"],
            materialImagePath: "/images/Black.jfif",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
        {
          id: "17",
          materialName: "Memory Cloud",
          materialTexturePaths: {
            "LOD-0": {
              baseColorPath: "/textures/Memory Cloud/LOD-0/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-0/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-0/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-0/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-0/Displacement.png",
            },
            "LOD-1": {
              baseColorPath: "/textures/Memory Cloud/LOD-1/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-1/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-1/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-1/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-1/Displacement.png",
            },
            "LOD-2": {
              baseColorPath: "/textures/Memory Cloud/LOD-2/Base_Color.png",
              // normalPath: "/textures/Memory Cloud/LOD-2/Normal.png",
              // roughnessPath: "/textures/Memory Cloud/LOD-2/Roughness.png",
              // metallicPath: "/textures/Memory Cloud/LOD-2/Metallic.png",
              // displacementPath:"/textures/Memory Cloud/LOD-2/Displacement.png",
            },
          },
          materialUsingCategories:{
            categoriesNames:["Towel Material"],
            materialImagePath: "/images/Brown.jpg",
          } ,
          materialThresholds:[0.7,1.2,1.5]
        },
      ],
    },
    Floor: {
      nickName: "FloorModel",
      modelPath: "/models/Floor2.glb",
      // position: [-7,-1.5,7],
      scale: [1.67,1.67,1.67],
    },
  },
  
  camera: {
    position: [-1, 1, 2],
    minDistance:0.4,
    maxDistance: 5,
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: Math.PI / 2.1,
  },

  measurementConfig:{
        // Example mesh: Right Armrest
        Armrest: {
          show:["height","depth"], // show
          gap: { width: 0, height: 0.05, depth: 0.15 },
          offset: {
            width: { x:0, y: 0.1 , z: 0.45 },
            height: { x: -0.12, y:0, z: -0.4 },
            depth: { x: -0.12, y: 0.2 , z:0 },
          },
          extraOffsetLabel:{
            width: { x:0, y: 0.05, z: 0 },
            // height: { x: 0, y:0, z: 0 },
            // depth: { x: 0, y: 0 , z:0 },
          }
        },
      
        // Example mesh: Back Support (only width & height)
        Support: {
          show: ["width",],
          gap: { width: 0.15},
          offset: {
            width: { x:0, y: 0, z: 0.6 },
          },
          extraOffsetLabel:{
            // width: { x:0, y:0, z: 0 },
            // height: { x: 0, y:0, z: 0 },
            // depth: { x: 0, y: 0 , z:0 },
          }
        },
        Seat001:{
          show: ["width",],
          gap: { width: 0.15,},
          offset: {
            width: { x:0, y: 0, z: 0.5 },
          },
          extraOffsetLabel:{
            // width: { x:0, y:0, z: 0 },
            // height: { x: 0, y:0, z: 0 },
            // depth: { x: 0, y: 0 , z:0 },
          }
        },
        Pillow001:{
          show: ["width",],
          gap: { width: 0,},
          offset: {
            width: { x:0, y: -0.13, z: 0.16 },
          },
          extraOffsetLabel:{
            width: { x:0, y:0.03, z: 0.04 },
            // height: { x: 0, y:0, z: 0 },
            // depth: { x: 0, y: 0 , z:0 },
          }
        }
      
        // Add more meshes here...
  }
};


