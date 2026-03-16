import MarqueeOne from "@/components/common/MarqueeOne";
import HeaderTwo from "@/components/layout/headers/HeaderTwo";
import React from "react";
import HeroHomeTwo from "./HeroHomeTwo";
import TopCategoryHomeTwo from "./TopCategoryHomeTwo";
import CertificateHomeTwo from "./CertificateHomeTwo";
import FooterTwo from "@/components/layout/footers/FooterTwo";

const HomeTwo = () => {
	return (
		<>
			<MarqueeOne />
			<HeaderTwo />
			<HeroHomeTwo />
			<TopCategoryHomeTwo />
			<MarqueeOne />
			<CertificateHomeTwo />
			<MarqueeOne />
			<FooterTwo />
		</>
	);
};

export default HomeTwo;
