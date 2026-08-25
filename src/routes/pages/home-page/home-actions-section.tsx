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
import { HeartHandshake, IdCard, Mail } from "lucide-react";
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
        accentColor="#65bff7"
        cta={t("page.home.actions.membership.cta")}
        description={t("page.home.actions.membership.description")}
        icon={IdCard}
        title={t("page.home.actions.membership.title")}
        to={t("page.membership.url")}
      />

      <HomeActionCard
        accentColor="#d64545"
        cta={t("page.home.actions.donation.cta")}
        description={t("page.home.actions.donation.description")}
        icon={HeartHandshake}
        title={t("page.home.actions.donation.title")}
        to={t("page.donation.url")}
      />

      <VStack
        align="stretch"
        bg="white"
        borderColor="ggt.surface.border"
        borderWidth="1px"
        gap={5}
        minH="13rem"
        p={5}
      >
        <Box color="fg" lineHeight={0}>
          <Mail size={24} />
        </Box>

        <VStack align="flex-start" flex={1} gap={2}>
          <Heading size="md">{t("page.home.actions.contact.title")}</Heading>
          <Text>{t("page.home.actions.contact.description")}</Text>
        </VStack>

        {(instagramLink || whatsAppLink) && (
          <Box display="flex" gap={5} justifyContent="center">
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
          </Box>
        )}

        {infoAddress && (
          <Button asChild size="sm" variant="solid">
            <a href={`mailto:${infoAddress}`}>
              {t("page.home.actions.contact.cta")}
            </a>
          </Button>
        )}
      </VStack>
    </SimpleGrid>
  );
}

//------------------------------------------------------------------------------
// Home Action Card
//------------------------------------------------------------------------------

type HomeActionCardProps = {
  accentColor: string;
  cta: string;
  description: string;
  icon: LucideIcon;
  title: string;
  to: string;
};

function HomeActionCard({
  accentColor,
  cta,
  description,
  icon: Icon,
  title,
  to,
}: HomeActionCardProps) {
  return (
    <VStack
      align="stretch"
      bg="white"
      borderColor="ggt.surface.border"
      borderWidth="1px"
      gap={5}
      minH="13rem"
      p={5}
    >
      <Box color={accentColor} lineHeight={0}>
        <Icon size={26} />
      </Box>

      <VStack align="flex-start" flex={1} gap={2}>
        <Heading size="md">{title}</Heading>
        <Text>{description}</Text>
      </VStack>

      <Button asChild size="sm" variant="solid">
        <RouterLink to={to}>{cta}</RouterLink>
      </Button>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Contact Icon Link
//------------------------------------------------------------------------------

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
    >
      <Image alt="" h="1.5rem" src={imageSrc} w="1.5rem" />
      {label}
    </Link>
  );
}
