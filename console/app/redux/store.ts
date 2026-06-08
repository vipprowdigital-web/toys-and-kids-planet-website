// app/redux/store.ts

import { configureStore } from "@reduxjs/toolkit";

// ⚙️ App Configuration Feature
import appConfigurationReducer from "~/features/app-configuration/data/appConfigurationSlice";
import { appConfigurationApi } from "~/features/app-configuration/data/appConfigurationApi";

// 🧍 Existing
import userReducer from "~/features/user/userSlice";

// 🗂 Blog Feature
import blogReducer from "~/features/blog/data/blogSlice";
import { blogApi } from "~/features/blog/data/blogApi";

// 🗂 Course Feature
import courseReducer from "~/features/course/data/courseSlice";
import { courseApi } from "~/features/course/data/courseApi";
// 🗂 Category Feature
import categoryReducer from "~/features/category/data/categorySlice";
import { categoryApi } from "~/features/category/data/categoryApi";

// 🗂 Domain Feature
import domainReducer from "~/features/domains/data/domainsSlice";
import { domainApi } from "~/features/domains/data/domainsApi";

// ⚙️ Service Feature
import serviceReducer from "~/features/service/data/serviceSlice";
import { serviceApi } from "~/features/service/data/serviceApi";

// ⚙️  Policy Feature
import policyReducer from "~/features/policy/data/policySlice";
import { policyApi } from "~/features/policy/data/policyApi";

// ⚙️  Testimonial Feature
import testimonialReducer from "~/features/testimonial/data/testimonialSlice";
import { testimonialApi } from "~/features/testimonial/data/testimonialApi";

// ⚙️  Gallery Feature
import galleryReducer from "~/features/gallery/data/gallerySlice";
import { galleryApi } from "~/features/gallery/data/galleryApi";

// ⚙️  Certificate Feature
import certificateReducer from "~/features/certificate/data/certificateSlice";
import { certificateApi } from "~/features/certificate/data/certificateApi";

// ⚙️  User Certificate Feature
import userCertificateReducer from "~/features/user-certificate/data/user-certificateSlice";
import { userCertificateApi } from "~/features/user-certificate/data/user-certificateApi";

// ⚙️  Contact Feature
import contactReducer from "~/features/contact/data/contactSlice";
import { contactApi } from "~/features/contact/data/contactApi";

// ⚙️  Product Category Feature
import productCategoryReducer from "~/features/product-categories/data/productCategorySlice";
import { productCategoryApi } from "~/features/product-categories/data/productCategoryApi";

// ⚙️  Product Feature
import productReducer from "~/features/products/data/productSlice";
import { productApi } from "~/features/products/data/productApi";

export const store = configureStore({
  reducer: {
    // ✅ App Configuration state + API
    appConfiguration: appConfigurationReducer,
    [appConfigurationApi.reducerPath]: appConfigurationApi.reducer,

    // ✅ User state
    user: userReducer,

    // ✅ Blog state + API
    blog: blogReducer,
    [blogApi.reducerPath]: blogApi.reducer,

    // ✅ Course state + API
    course: courseReducer,
    [courseApi.reducerPath]: courseApi.reducer,

    // ✅ Category state + API
    category: categoryReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,

    // ✅ Domain state + API
    domain: domainReducer,
    [domainApi.reducerPath]: domainApi.reducer,

    // ✅ Service state + API
    service: serviceReducer,
    [serviceApi.reducerPath]: serviceApi.reducer,

    // ✅ Policy state + API
    policy: policyReducer,
    [policyApi.reducerPath]: policyApi.reducer,

    // ✅ Testimonial state + API
    testimonial: testimonialReducer,
    [testimonialApi.reducerPath]: testimonialApi.reducer,

    // ✅ Gallery state + API
    gallery: galleryReducer,
    [galleryApi.reducerPath]: galleryApi.reducer,

    // ✅ Certificate state + API
    certificate: certificateReducer,
    [certificateApi.reducerPath]: certificateApi.reducer,

    // ✅ User Certificate state + API
    userCertificate: userCertificateReducer,
    [userCertificateApi.reducerPath]: userCertificateApi.reducer,

    // ✅ Contact state + API
    contact: contactReducer,
    [contactApi.reducerPath]: contactApi.reducer,

    // ✅ Contact state + API
    productCategory: productCategoryReducer,
    [productCategoryApi.reducerPath]: productCategoryApi.reducer,

    // ✅ Product state + API
    product: productReducer,
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      appConfigurationApi.middleware,
      blogApi.middleware,
      courseApi.middleware,
      categoryApi.middleware,
      domainApi.middleware,
      serviceApi.middleware,
      policyApi.middleware,
      testimonialApi.middleware,
      galleryApi.middleware,
      certificateApi.middleware,
      userCertificateApi.middleware,
      contactApi.middleware,
      productCategoryApi.middleware,
      productApi.middleware,
    ),
});

// ✅ Type Inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
