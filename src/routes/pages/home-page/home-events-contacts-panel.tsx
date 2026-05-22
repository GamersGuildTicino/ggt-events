import {
  Button,
  Flex,
  HStack,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import Eyebrow from "~/ui/eyebrow";

//------------------------------------------------------------------------------
// Home Events Contacts Panel
//------------------------------------------------------------------------------

export default function HomeEventsContactsPanel() {
  const { t } = useI18n();
  const instagramLink = import.meta.env["VITE_INSTAGRAM_LINK"];
  const membershipFormLink = import.meta.env["VITE_MEMBERSHIP_FORM_LINK"];
  const whatsAppLink = import.meta.env["VITE_WHATS_APP_LINK"];

  if (!instagramLink && !membershipFormLink && !whatsAppLink) return null;

  return (
    <Flex
      align="stretch"
      direction={{ base: "column", sm: "row" }}
      flex={1}
      gap={2}
      w="full"
    >
      {(instagramLink || whatsAppLink) && (
        <VStack
          align="stretch"
          bgColor="publicSurfaceBg"
          borderColor="publicSurfaceBorder"
          borderWidth="1px"
          flex={1}
          gap={4}
          p={6}
        >
          <Eyebrow>{t("page.home.events.contacts_follow")}</Eyebrow>

          <HStack
            align="center"
            gap={5}
            h="full"
            justify="space-evenly"
            w="full"
          >
            {instagramLink && (
              <ContactLink
                href={instagramLink}
                imageSrc="/images/instagram_logo.png"
                label={t("layout.public_footer.instagram")}
              />
            )}

            {whatsAppLink && (
              <ContactLink
                href={whatsAppLink}
                imageSrc="/images/whats_app_logo.png"
                label={t("layout.public_footer.whatsapp")}
              />
            )}
          </HStack>
        </VStack>
      )}

      {membershipFormLink && (
        <VStack
          align="stretch"
          bgColor="publicSurfaceBg"
          borderColor="publicSurfaceBorder"
          borderWidth="1px"
          flex={1}
          gap={4}
          p={6}
        >
          <Eyebrow>{t("page.home.events.contacts_join")}</Eyebrow>
          <Text color="fg.muted" fontSize="sm">
            {t("page.home.events.contacts_join_description")}
          </Text>
          <Button asChild size="sm" variant="outline">
            <a href={membershipFormLink} rel="noreferrer" target="_blank">
              {t("page.home.events.contacts_join_cta")}
            </a>
          </Button>
        </VStack>
      )}
    </Flex>
  );
}

//------------------------------------------------------------------------------
// Contact Link
//------------------------------------------------------------------------------

type ContactLinkProps = {
  href: string;
  imageSrc: string;
  label: string;
};

function ContactLink({ href, imageSrc, label }: ContactLinkProps) {
  return (
    <Link
      _hover={{ color: "publicAccentBorder" }}
      alignItems="center"
      aria-label={label}
      color="fg"
      display="inline-flex"
      flexDirection="column"
      fontSize="sm"
      fontWeight="medium"
      gap={1}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <Image alt="" h="2rem" src={imageSrc} w="2rem" />
      {label}
    </Link>
  );
}
