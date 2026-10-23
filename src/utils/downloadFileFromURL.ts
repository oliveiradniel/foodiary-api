export async function downloadFileFromURL(url: string): Promise<Buffer> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to download file (${response.status}): ${url}`);
	}

	const arrayBuffer = await response.arrayBuffer();

	return Buffer.from(arrayBuffer);
}
