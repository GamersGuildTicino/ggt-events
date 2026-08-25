import {
  Box,
  Button,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Actions Section
//------------------------------------------------------------------------------

export default function HomeActionsSection() {
  const { t } = useI18n();
  const instagramLink = import.meta.env["VITE_INSTAGRAM_LINK"];
  const whatsAppLink = import.meta.env["VITE_WHATS_APP_LINK"];
  const infoAddress = import.meta.env["VITE_INFO_ADDRESS"];

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} w="full">
      <HomeActionCard
        cta={t("page.home.actions.membership.cta")}
        description={t("page.home.actions.membership.description")}
        title={t("page.home.actions.membership.title")}
        to={t("page.membership.url")}
      />

      <HomeActionCard
        buttonColorPalette="pink"
        cta={t("page.home.actions.donation.cta")}
        ctaIcon={Heart}
        description={t("page.home.actions.donation.description")}
        title={t("page.home.actions.donation.title")}
        to={t("page.donation.url")}
      />

      <VStack
        align="stretch"
        bg="white"
        borderColor="ggt.surface.border"
        borderRadius="0.35rem"
        borderWidth="1px"
        boxShadow="0 0.5rem 1.25rem rgba(14, 66, 99, 0.12)"
        gap={5}
        minH="13rem"
        p={5}
      >
        <VStack align="flex-start" flex={1} gap={2}>
          <Heading
            fontFamily="'Shrikhand', Georgia, serif"
            fontWeight="light"
            size="xl"
          >
            {t("page.home.actions.contact.title")}
          </Heading>
          <Text>{t("page.home.actions.contact.description")}</Text>
        </VStack>

        {(instagramLink || whatsAppLink || infoAddress) && (
          <Box display="flex" flexWrap="wrap" gap={3} justifyContent="center">
            {instagramLink && (
              <ContactIconLink
                href={instagramLink}
                imageSrc="/images/instagram_logo.png"
                label={t("layout.public_footer.instagram")}
              />
            )}

            {whatsAppLink && (
              <ContactIconLink
                href={whatsAppLink}
                imageSrc="/images/whats_app_logo.png"
                label={t("layout.public_footer.whatsapp")}
              />
            )}

            {infoAddress && (
              <ContactIconLink
                href={`mailto:${infoAddress}`}
                imageSrc="/images/mail_logo.svg"
                label={t("page.home.actions.contact.cta")}
              />
            )}
          </Box>
        )}
      </VStack>
    </SimpleGrid>
  );
}

//------------------------------------------------------------------------------
// Home Action Card
//------------------------------------------------------------------------------

type HomeActionCardProps = {
  buttonColorPalette?: string;
  cta: string;
  ctaIcon?: LucideIcon;
  description: string;
  title: string;
  to: string;
};

function HomeActionCard({
  buttonColorPalette,
  cta,
  ctaIcon: CtaIcon,
  description,
  title,
  to,
}: HomeActionCardProps) {
  return (
    <VStack
      align="stretch"
      bg="white"
      borderColor="ggt.surface.border"
      borderRadius="0.35rem"
      borderWidth="1px"
      boxShadow="0 0.5rem 1.25rem rgba(14, 66, 99, 0.12)"
      gap={5}
      minH="13rem"
      p={5}
    >
      <VStack align="flex-start" flex={1} gap={2}>
        <Heading
          fontFamily="'Shrikhand', Georgia, serif"
          fontWeight="light"
          size="xl"
        >
          {title}
        </Heading>
        <Text>{description}</Text>
      </VStack>

      <Button
        asChild
        colorPalette={buttonColorPalette}
        size="sm"
        variant="solid"
      >
        <RouterLink to={to}>
          {CtaIcon && <CtaIcon size={16} />}
          {cta}
        </RouterLink>
      </Button>
    </VStack>
  );
}

type ContactIconLinkProps = {
  href: string;
  imageSrc: string;
  label: string;
};

function ContactIconLink({ href, imageSrc, label }: ContactIconLinkProps) {
  return (
    <Link
      alignItems="center"
      aria-label={label}
      color="fg"
      display="inline-flex"
      flexDirection="column"
      fontSize="sm"
      fontWeight="medium"
      gap={1}
      h="2.5rem"
      href={href}
      justifyContent="center"
      rel="noreferrer"
      target="_blank"
      textAlign="center"
      w="4.75rem"
    >
      <Image alt="" h="1.5rem" src={imageSrc} w="1.5rem" />
      {label}
    </Link>
  );
}
