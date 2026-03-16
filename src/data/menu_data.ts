import { StaticImageData } from "next/image";

import demo_img_1 from "../../public/assets/img/header/home-1.jpg";
import demo_img_2 from "../../public/assets/img/header/home-2.jpg";



interface DataType {
	id: number;
	title_th: string;
	title_en: string;
	link: string;
	icon: string;
	img_dropdown?: boolean;
	has_dropdown?: boolean;
	has_dropdown_inner?: boolean;
	sub_menus?: {
		link?: string;
		title_th?: string;
		title_en?: string;
		title?: string;
		title2?: string | any;
		btn_title?: string;
		one_page_link?: string | any;
		one_page_title?: string;
		demo_img?: StaticImageData | any;
		inner_menu?: boolean;
		inner_menus?: {
			link?: string; title?: string
		}[];
	}[];
}

// menu data - Pharmacy Academy
const menu_data: DataType[] = [
	{
		id: 1,
		title_th: "หน้าแรก",
		title_en: "Home",
		link: "/",
		icon: "fas fa-home-lg",
		has_dropdown: false,
	},
	{
		id: 2,
		title_th: "คอร์สเรียน",
		title_en: "Courses",
		link: "/courses-grid",
		icon: "fas fa-book",
		has_dropdown: false,
	},
	{
		id: 3,
		title_th: "เกี่ยวกับเรา",
		title_en: "About Us",
		link: "/about_us",
		icon: "fas fa-info-circle",
		has_dropdown: false,
	},
];
export default menu_data;
