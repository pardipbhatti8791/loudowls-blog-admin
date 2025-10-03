export interface Author {
  id: string;
  name: string;
  designation?: string;
  description?: string;
  profile_photo?: string;
  active: boolean;
  email?: string;
  bio?: string;
  social_links?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreateAuthorForm {
  name: string;
  designation?: string;
  description?: string;
  profile_photo?: string;
  active: boolean;
  email?: string;
  bio?: string;
  social_links?: Record<string, string>;
}

class AuthorsApi {
  async getAuthors(params?: { search?: string; active?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.active !== undefined) searchParams.append("active", params.active);

    const response = await fetch(`/api/authors?${searchParams}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch authors");
    }
    const data = await response.json();
    return data.data as Author[];
  }

  async getAuthor(id: string) {
    const response = await fetch(`/api/authors/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch author");
    }
    const data = await response.json();
    return data.data as Author;
  }

  async createAuthor(form: CreateAuthorForm) {
    const response = await fetch("/api/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create author");
    }
    const data = await response.json();
    return data.data as Author;
  }

  async updateAuthor(id: string, form: Partial<CreateAuthorForm>) {
    const response = await fetch(`/api/authors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update author");
    }
    const data = await response.json();
    return data.data as Author;
  }

  async deleteAuthor(id: string) {
    const response = await fetch(`/api/authors/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete author");
    }
    return true;
  }
}

export const authorsApi = new AuthorsApi();