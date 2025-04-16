import { Request } from 'express'

import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE } from '@root/constants'

export const generatePaginationQueryParams = (req: Request) => {
  const { page, limit, orderBy, orderDirection } = req.query

  const pagination = {
    page: page ? parseInt(page as string) : DEFAULT_PAGE,
    limit: limit ? parseInt(limit as string) : DEFAULT_PAGE_LIMIT,
    orderBy: orderBy ? (orderBy as string) : 'createdAt',
    orderDirection: orderDirection ? (orderDirection as string) : 'desc'
  }

  return pagination
}

export const getRandomColor = () => {
  const colors = [
    { r: 255, g: 0, b: 0 },    // Đỏ
    { r: 0, g: 255, b: 0 },    // Xanh lá
    { r: 0, g: 0, b: 255 },    // Xanh dương
    { r: 255, g: 255, b: 0 },  // Vàng
    { r: 255, g: 165, b: 0 },  // Cam
    { r: 128, g: 0, b: 128 },  // Tím
    { r: 255, g: 105, b: 180 }, // Hồng (Hot Pink)
    { r: 255, g: 192, b: 203 }, // Hồng nhạt (Light Pink)
    { r: 221, g: 160, b: 221 }, // Tím nhạt (Plum)
    { r: 255, g: 20, b: 147 },  // Hồng đậm (Deep Pink)
    { r: 173, g: 216, b: 230 }, // Xanh ngọc nhạt (Light Blue)
  ];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  const toHex = (value: number) => ('0' + value.toString(16)).slice(-2);
  return `#${toHex(randomColor.r)}${toHex(randomColor.g)}${toHex(randomColor.b)}`;
}
