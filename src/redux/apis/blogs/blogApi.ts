import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

export interface BlogListItem {
    id: string;
    blog_title: string;
    blog_slug: string;
    feature_image: string | null;
    category_name: string;
    category_slug: string;
    blog_excerpt: string;
    is_active: boolean;
    created_at: string;
}

export interface BlogCategorySummary {
    id: string;
    name: string;
    category_slug: string;
    blog_count: number;
    is_active: boolean;
}

export interface BlogListData {
    count: number;
    next: string | null;
    previous: string | null;
    results: BlogListItem[];
    categories_summary: BlogCategorySummary[];
}

export interface BlogListResponse {
    success: boolean;
    message: string;
    data: BlogListData;
}

export interface GetBlogsParams {
    page?: number;
    page_size?: number;
    search?: string;
    category_slug?: string;
    is_active?: boolean;
}

export const blogApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBlogs: builder.query<BlogListResponse, GetBlogsParams | void>({
            query: (args) => {
                const filteredParams = cleanObject(args);
                return {
                    url: "/api/blogs/",
                    method: "GET",
                    params: filteredParams,
                };
            },
            providesTags: ["BLOGS"],
        }),
        createBlog: builder.mutation({
            query: (body) => ({
                url: "/api/blogs/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        getBlog: builder.query({
            query: (blogSlug) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "GET",
            }),
            providesTags: ["BLOG"],
        }),
        updateBlog: builder.mutation({
            query: ({ blogSlug, body }) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        patchBlog: builder.mutation({
            query: ({ blogSlug, body }) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        deleteBlog: builder.mutation({
            query: (blogSlug) => ({
                url: `/api/blogs/${blogSlug}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["BLOGS", "BLOG"],
        }),
        getBlogCategories: builder.query({
            query: (args) => {
                const filteredParams = cleanObject(args);
                return {
                    url: "/api/blogs/blog-categories/",
                    method: "GET",
                    params: filteredParams,
                };
            },
            providesTags: ["BLOGS_CATEGORIES"],
        }),
        createBlogCategory: builder.mutation({
            query: (body) => ({
                url: "/api/blogs/blog-categories/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
        getBlogCategory: builder.query({
            query: (categorySlug) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "GET",
            }),
            providesTags: ["BLOGS_CATEGORIES"],
        }),
        updateBlogCategory: builder.mutation({
            query: ({ categorySlug, body }) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
        patchBlogCategory: builder.mutation({
            query: ({ categorySlug, body }) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
        deleteBlogCategory: builder.mutation({
            query: (categorySlug) => ({
                url: `/api/blogs/blog-categories/${categorySlug}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["BLOGS_CATEGORIES"],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useCreateBlogMutation,
    useGetBlogQuery,
    useUpdateBlogMutation,
    usePatchBlogMutation,
    useDeleteBlogMutation,
    useGetBlogCategoriesQuery,
    useCreateBlogCategoryMutation,
    useGetBlogCategoryQuery,
    useUpdateBlogCategoryMutation,
    usePatchBlogCategoryMutation,
    useDeleteBlogCategoryMutation,
} = blogApi;
