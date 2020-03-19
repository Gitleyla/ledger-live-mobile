// @flow

import React, { useCallback, useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Trans, translate } from "react-i18next";
import type { TFunction } from "react-i18next";
import {
  formatCurrencyUnit,
  findCryptoCurrencyById,
} from "@ledgerhq/live-common/lib/currencies";
import { getCryptoCurrencyIcon } from "@ledgerhq/live-common/lib/reactNative";
import colors from "../../colors";
import LText from "../../components/LText";
import Info from "../../icons/Info";
import InfoModal from "../../modals/Info";
import type { ModalInfo } from "../../modals/Info";

interface Props {
  account: any;
  countervalue: any;
  t: TFunction;
}

const formatConfig = {
  disableRounding: true,
  alwaysShowSign: false,
  showCode: true,
};

type InfoName = "available" | "power" | "bandwidth" | "energy";

function AccountBalanceSummaryFooter({ account, t }: Props) {
  const [infoName, setInfoName] = useState<InfoName | typeof undefined>();
  const infoCandidates = getInfoCandidates(t);

  const {
    energy: formattedEnergy,
    bandwidth: { freeUsed, freeLimit, gainedUsed, gainedLimit } = {},
    tronPower,
  } = account.tronResources;

  const spendableBalance = useMemo(
    () =>
      formatCurrencyUnit(account.unit, account.spendableBalance, formatConfig),
    [account.unit, account.spendableBalance],
  );

  const formattedBandwidth = useMemo(
    () => freeLimit + gainedLimit - gainedUsed - freeUsed,
    [freeLimit, gainedLimit, gainedUsed, freeUsed],
  );

  const onCloseModal = useCallback(() => {
    setInfoName(undefined);
  }, []);

  const onPressInfoCreator = useCallback(
    (infoName: InfoName) => () => setInfoName(infoName),
    [],
  );

  const isModalOpen = useMemo(() => !!infoName, [infoName]);

  const data = useMemo(() => (infoName ? infoCandidates[infoName] : []), [
    infoName,
    infoCandidates,
  ]);

  if (!account.tronResources) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.root}
    >
      <InfoModal isOpened={isModalOpen} onClose={onCloseModal} data={data} />

      <InfoItem
        title={t("account.availableBalance")}
        onPress={onPressInfoCreator("available")}
        value={spendableBalance}
      />
      <InfoItem
        title={t("account.tronPower")}
        onPress={onPressInfoCreator("power")}
        value={tronPower}
      />
      <InfoItem
        title={t("account.bandwidth")}
        onPress={onPressInfoCreator("bandwidth")}
        value={formattedBandwidth.toString() || "–"}
      />
      <InfoItem
        title={t("account.energy")}
        onPress={onPressInfoCreator("energy")}
        value={formattedEnergy.toString() || "-"}
      />
    </ScrollView>
  );
}

export default translate()(AccountBalanceSummaryFooter);

interface InfoItemProps {
  onPress: () => void;
  title: string;
  value: string;
}

function InfoItem({ onPress, title, value }: InfoItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.balanceContainer}>
      <View style={styles.balanceLabelContainer}>
        <LText style={styles.balanceLabel}>{title}</LText>
        <Info size={12} color={colors.grey} />
      </View>
      <LText semiBold style={styles.balance}>
        {value}
      </LText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.lightFog,
    paddingTop: 16,
    overflow: "visible",
  },
  balanceContainer: {
    flexBasis: "auto",
    flexDirection: "column",
    marginRight: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    backgroundColor: colors.lightGrey,
  },
  balanceLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },
  balanceLabel: {
    fontSize: 13,
    lineHeight: 16,
    color: colors.grey,
    marginRight: 6,
  },
  balance: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.darkBlue,
  },
});

function getInfoCandidates(t: TFunction): { [key: InfoName]: ModalInfo[] } {
  const TronIcon = getTronIcon();

  return {
    available: [
      {
        Icon: () => <TronIcon />,
        title: t("tron.info.available.title"),
        description: t("tron.info.available.description"),
      },
    ],
    power: [
      {
        Icon: () => <TronIcon />,
        title: t("tron.info.power.title"),
        description: t("tron.info.power.description"),
      },
    ],
    bandwidth: [
      {
        Icon: () => <TronIcon />,
        title: t("tron.info.bandwidth.title"),
        description: t("tron.info.bandwidth.description"),
      },
    ],
    energy: [
      {
        Icon: () => <TronIcon />,
        title: t("tron.info.energy.title"),
        description: t("tron.info.energy.description"),
      },
    ],
  };
}

function getTronIcon(): React$ComponentType<{}> {
  const currency = findCryptoCurrencyById("tron");
  const TronIcon = getCryptoCurrencyIcon(currency);
  return () => <TronIcon color={currency.color} size={18} />;
}
