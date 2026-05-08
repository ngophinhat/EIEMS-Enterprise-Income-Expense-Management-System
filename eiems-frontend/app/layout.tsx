import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import "./globals.css";

export const metadata: Metadata = {
  title: "EIEMS Bakery",
  description: "Hệ thống quản lý tiệm bánh rau câu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <ConfigProvider
            locale={viVN}
            theme={{
              token: {
                colorPrimary: "#1a1a2e",
                borderRadius: 8,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              },
              components: {
                Menu: {
                  darkItemBg: "transparent",
                  darkItemSelectedBg: "rgba(255,255,255,0.12)",
                  darkItemHoverBg: "rgba(255,255,255,0.08)",
                },
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
