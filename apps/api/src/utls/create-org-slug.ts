export function createOrgSlug(text: string): string {
	return text
		.normalize("NFD")
		.replace("/[\u0300-\u036f]/g", "")
		.replace(/[^\w\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.toLowerCase();
}
