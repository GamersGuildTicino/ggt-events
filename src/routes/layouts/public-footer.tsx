import {
  Flex,
  HStack,
  Link,
  Span,
  Text,
  VStack,
  createIcon,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import InstagramIcon from "~/icons/instagram-icon";
import WhatsAppIcon from "~/icons/whats-app-icon";

//------------------------------------------------------------------------------
// Public Footer
//------------------------------------------------------------------------------

export default function PublicFooter() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  const instagramLink = import.meta.env["VITE_INSTAGRAM_LINK"];
  const whatsAppLink = import.meta.env["VITE_WHATS_APP_LINK"];

  return (
    <Flex
      align={{ base: "flex-start", md: "flex-start" }}
      color="fg.inverted"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 4, md: 12 }}
      justify="space-between"
      py={8}
      w="full"
    >
      <VStack align="flex-start" gap={1}>
        <Text fontWeight="semibold">Gamers Guild Ticino</Text>
        <Text color="whiteAlpha.700" fontSize="sm">
          © {currentYear} {t("layout.public_footer.copyright")}
        </Text>
      </VStack>

      <VStack
        align={{ base: "flex-start", md: "flex-end" }}
        gap={0}
        textAlign={{ base: "left", md: "right" }}
      >
        <Link _hover={{ color: "whiteAlpha.800" }} asChild color="fg.inverted">
          <RouterLink to={t("page.data_and_terms.url")}>
            {t("layout.public_footer.data_and_terms")}
          </RouterLink>
        </Link>
        <Link
          _hover={{ color: "whiteAlpha.800" }}
          color="fg.inverted"
          href="mailto:info@gamersguildticino.ch"
        >
          {t("layout.public_footer.email")}
        </Link>

        {instagramLink && whatsAppLink && (
          <HStack separator={<ContactsSeparator />}>
            {instagramLink && (
              <ContactIconButton
                Icon={InstagramIcon}
                href={instagramLink}
                label={t("layout.public_footer.instagram")}
              />
            )}

            {whatsAppLink && (
              <ContactIconButton
                Icon={WhatsAppIcon}
                href={whatsAppLink}
                label={t("layout.public_footer.whatsapp")}
              />
            )}
          </HStack>
        )}
      </VStack>
    </Flex>
  );
}

//------------------------------------------------------------------------------
// Contact Icon Button
//------------------------------------------------------------------------------

type ContactIconButtonProps = {
  Icon: LucideIcon | ReturnType<typeof createIcon>;
  href: string;
  label: string;
};

function ContactIconButton({ Icon, href, label }: ContactIconButtonProps) {
  return (
    <Link
      _hover={{ color: "whiteAlpha.800" }}
      aria-label={label}
      color="fg.inverted"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Icon _hover={{ fill: "whiteAlpha.800" }} fill="fg.inverted" size="sm" />
    </Link>
  );
}

//------------------------------------------------------------------------------
// Contacts Separator
//------------------------------------------------------------------------------

function ContactsSeparator() {
  const zeroWidthSpace = "\u200b";
  return <Span w={2}>{zeroWidthSpace}</Span>;
}
