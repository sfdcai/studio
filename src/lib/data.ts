export type MediaFile = {
  id: string
  originalSize: number
  compressedSize: number
  status: "pending" | "processing" | "success" | "failed"
  camera: string,
  createdDate: string
  lastCompressed: string
  nextCompression: string
}

export const data: MediaFile[] = [
    { id: "m5gr84i9", originalSize: 420, compressedSize: 316, status: "success", camera: "Sony A7III", createdDate: "2023-10-25", lastCompressed: "2023-10-25T10:00:00Z", nextCompression: "2024-10-25" },
    { id: "3u1reuv4", originalSize: 350, compressedSize: 242, status: "success", camera: "Canon R5", createdDate: "2023-10-25", lastCompressed: "2023-10-25T11:00:00Z", nextCompression: "2024-10-25" },
    { id: "derv1ws0", originalSize: 950, compressedSize: 837, status: "processing", camera: "Nikon Z6", createdDate: "2023-10-26", lastCompressed: "2023-10-26T12:00:00Z", nextCompression: "2024-10-26" },
    { id: "5kma53ae", originalSize: 1000, compressedSize: 874, status: "success", camera: "Sony A7III", createdDate: "2023-10-27", lastCompressed: "2023-10-27T13:00:00Z", nextCompression: "2024-10-27" },
    { id: "bhqecj4p", originalSize: 800, compressedSize: 721, status: "failed", camera: "iPhone 14 Pro", createdDate: "2023-10-28", lastCompressed: "N/A", nextCompression: "N/A" },
    { id: "m5gr84i9-2", originalSize: 420, compressedSize: 316, status: "success", camera: "Sony A7III", createdDate: "2023-10-25", lastCompressed: "2023-10-25T14:00:00Z", nextCompression: "2024-10-25" },
    { id: "3u1reuv4-2", originalSize: 350, compressedSize: 242, status: "success", camera: "Canon R5", createdDate: "2023-10-25", lastCompressed: "2023-10-25T15:00:00Z", nextCompression: "2024-10-25" },
    { id: "derv1ws0-2", originalSize: 950, compressedSize: 837, status: "processing", camera: "Nikon Z6", createdDate: "2023-10-26", lastCompressed: "2023-10-26T16:00:00Z", nextCompression: "2024-10-26" },
    { id: "5kma53ae-2", originalSize: 1000, compressedSize: 874, status: "success", camera: "iPhone 14 Pro", createdDate: "2023-10-27", lastCompressed: "2023-10-27T17:00:00Z", nextCompression: "2024-10-27" },
    { id: "bhqecj4p-2", originalSize: 800, compressedSize: 721, status: "failed", camera: "iPhone 14 Pro", createdDate: "2023-10-28", lastCompressed: "N/A", nextCompression: "N/A" },
]
