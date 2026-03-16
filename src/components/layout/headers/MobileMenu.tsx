
"use client"
import menu_data from "@/data/menu_data";
import Link from "next/link";
import React, { useState } from "react";
import { useLanguage } from "@/features/i18n";

const MobileMenu = () => {
	const { language } = useLanguage();
	const [navTitle, setNavTitle] = useState("");
	//openMobileMenu
	const openMobileMenu = (menu: string) => {
		if (navTitle === menu) {
			setNavTitle("");
		} else {
			setNavTitle(menu);
		}
	};

	const [navTitle2, setNavTitle2] = useState("");
	//openMobileMenu
	const openMobileMenu2 = (menu: string) => {
		if (navTitle2 === menu) {
			setNavTitle2("");
		} else {
			setNavTitle2(menu);
		}
	};

	// Helper to get title based on language
	const getTitle = (item: { title_th?: string; title_en?: string; title?: string }) => {
		if (language === 'th') {
			return item.title_th || item.title || '';
		}
		return item.title_en || item.title || '';
	};

	return (
		<>
			<div className="mean-bar">
				<a href="#nav" className="meanmenu-reveal">
					<span>
						<span>
							<span></span>
						</span>
					</span>
				</a>
				<nav className="mean-nav">
					<ul>
						{menu_data.map((item, i) => {
							const itemTitle = getTitle(item);
							return (
								<li key={i} className={item.has_dropdown ? "has-dropdown" : ""}>
									<Link href={item.link}>
										{itemTitle}
									</Link>
									<ul className="submenu" style={{ display: navTitle === itemTitle ? "block" : "none" }}>
										{item?.sub_menus?.map((inner_item, index) => {
											const innerTitle = getTitle(inner_item);
											return (
												<React.Fragment key={index}>
													{innerTitle && (
														<>
															<li>
																<Link href={inner_item.link ?? ""}>{innerTitle}</Link>
																{inner_item.inner_menu ? (
																	<a
																		className={`mean-expand ${innerTitle === navTitle2 ? "mean-clicked" : ""}`}
																		href="#"
																		onClick={() => openMobileMenu2(innerTitle)}
																	>
																		<i className="far fa-plus"></i>
																	</a>
																) : null}
															</li>
															{index === 5 && item.has_dropdown_inner && (
																<li>
																	<ul className="submenu" style={{ display: navTitle2 === innerTitle ? "block" : "none" }}>
																		<li><Link href="/news">Blog</Link></li>
																		<li><Link href="/news-details">Blog Details</Link></li>
																	</ul>
																</li>
															)}
														</>
													)}
												</React.Fragment>
											);
										})}
									</ul>
									{item.has_dropdown || item.img_dropdown ? (
										<a
											className={`mean-expand ${itemTitle === navTitle ? "mean-clicked" : ""}`}
											href="#"
											onClick={() => openMobileMenu(itemTitle)}
										>
											<i className="far fa-plus"></i>
										</a>
									) : null}
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</>
	);
};

export default MobileMenu;
