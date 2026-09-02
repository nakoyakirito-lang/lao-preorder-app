import { Order, STATUS_CONFIG } from '@/types/database';
import { formatLAK, formatForeignCurrency } from './calculations';

/**
 * Generate customized notification messages for customers (WhatsApp / Facebook)
 */
export function generateCustomerMessage(order: Order, type: 'order_created' | 'arrived' | 'delivering' | 'full_receipt'): string {
  const routeName = order.route === 'CHINA_LAOS' ? 'ຈີນ ➔ ລາວ 🇨🇳🇱🇦' : 'ໄທ ➔ ລາວ 🇹🇭🇱🇦';
  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track/${order.tracking_code}` : `https://your-domain.com/track/${order.tracking_code}`;
  const statusInfo = STATUS_CONFIG[order.status]?.labelLao || order.status;

  const destLocation = order.delivery_province
    ? `${order.delivery_provider} (${order.delivery_province} - ${order.delivery_branch || 'ສາຂາຫຼັກ'})`
    : `${order.delivery_provider} - ${order.delivery_branch || 'ສາຂາຫຼັກ'}`;

  if (type === 'order_created') {
    return `📦【 ແຈ້ງການຮັບອໍເດີພຣີອໍເດີ 】
━━━━━━━━━━━━━━━━━━━━
👤 ລູກຄ້າ: ${order.customer_name}
📱 ເບີໂທ: ${order.customer_phone}
📍 ຂົນສົ່ງປາຍທາງ: ${destLocation}
🛣️ ສາຍທາງ: ${routeName}
🏷️ ເລກຕິດຕາມ: ${order.tracking_code}

🛒 ສິນຄ້າ: ${order.product_name}
💰 ລາຄາຕົ້ນທາງ: ${formatForeignCurrency(order.origin_cost, order.origin_currency)} (ເລດ ${order.exchange_rate.toLocaleString()})
💵 ຕົ້ນທຶນສິນຄ້າ: ${formatLAK(order.product_cost_lak)}
💳 ເງິນມັດຈຳທີ່ຈ່າຍແລ້ວ: ${formatLAK(order.deposit_lak)}

⏳ ຄ່າຂົນສົ່ງມາລາວ: (ຈະຄິດໄລ່ເມື່ອສິນຄ້າຮອດສາງລາວ)
🔗 ກວດສອບສະຖານະພັດສະດຸ: ${trackingUrl}
━━━━━━━━━━━━━━━━━━━━
ຂອບໃຈທີ່ໄວ້ວາງໃຈໃຊ້ບໍລິການນຳພວກເຮົາ! 🙏✨`;
  }

  if (type === 'arrived') {
    const priceLabel = order.service_type === 'PREORDER' ? '💵 ລາຄາສິນຄ້າ:' : '💵 ຄ່າສິນຄ້າ:';
    const displayProductPrice =
      order.service_type === 'PREORDER' && order.selling_price_lak
        ? order.selling_price_lak
        : order.product_cost_lak;

    return `🎉【 ແຈ້ງເຕືອນ: ສິນຄ້າຮອດສາງລາວແລ້ວ! 🇱🇦 】
━━━━━━━━━━━━━━━━━━━━
👤 ລູກຄ້າ: ${order.customer_name}
📱 ເບີໂທ: ${order.customer_phone}
🏷️ ເລກຕິດຕາມ: ${order.tracking_code}
🛒 ສິນຄ້າ: ${order.product_name}
📍 ຂົນສົ່ງປາຍທາງ: ${destLocation}

${priceLabel} ${formatLAK(displayProductPrice)}
🚚 ຄ່າຂົນສົ່ງມາລາວ: ${formatLAK(order.shipping_cost_lak)}
━━━━━━━━━━━━━━━━━━━━
💰 ຍອດລວມທັງໝົດ: ${formatLAK(order.total_cost_lak)}
💳 ມັດຈຳແລ້ວ: -${formatLAK(order.deposit_lak)}
🔥 ຍອດທີ່ຕ້ອງຊຳລະ / COD: 👉 ${formatLAK(order.balance_due_lak)} 👈

🔗 ກົດເບິ່ງບິນ ແລະ ສະຖານະພັດສະດຸ:
${trackingUrl}
━━━━━━━━━━━━━━━━━━━━
ກະລຸນາກວດສອບຍອດເງິນ ແລະ ແຈ້ງຈັດສົ່ງໄດ້ເລີຍ! 🛵📦`;
  }

  if (type === 'delivering') {
    return `🛵【 ແຈ້ງການ: ສິນຄ້າກຳລັງຈັດສົ່ງ 】
━━━━━━━━━━━━━━━━━━━━
👤 ລູກຄ້າ: ${order.customer_name}
🏷️ ເລກຕິດຕາມ: ${order.tracking_code}
📍 ຂົນສົ່ງ: ${destLocation}
💰 ຍອດເກັບປາຍທາງ (COD): ${formatLAK(order.balance_due_lak)}

🔗 ເບິ່ງລາຍລະອຽດ: ${trackingUrl}
━━━━━━━━━━━━━━━━━━━━
ສິນຄ້າກຳລັງເດີນທາງໄປຫາທ່ານ ກະລຸນາລໍຖ້າຮັບສາຍຈາກພະນັກງານຂົນສົ່ງ ຂອບໃຈຫຼາຍໆ! 🙏✨`;
  }

  // default: full_receipt
  return `📋【 ໃບບິນສະຫຼຸບລາຍການພັດສະດຸ 】
━━━━━━━━━━━━━━━━━━━━
🏷️ ລະຫັດບິນ: ${order.tracking_code}
👤 ຜູ້ຮັບ: ${order.customer_name} (${order.customer_phone})
📍 ປາຍທາງ: ${destLocation}
🛒 ລາຍການ: ${order.product_name}
🛣️ ສາຍ: ${routeName}
📊 ສະຖານະ: ${statusInfo}

1️⃣ ຄ່າສິນຄ້າ: ${formatLAK(order.product_cost_lak)}
2️⃣ ຄ່າຂົນສົ່ງ: ${formatLAK(order.shipping_cost_lak)}
3️⃣ ຍອດລວມ: ${formatLAK(order.total_cost_lak)}
4️⃣ ມັດຈຳ: ${formatLAK(order.deposit_lak)}
━━━━━━━━━━━━━━━━━━━━
👉 ຍອດຄ້າງຊຳລະ: ${formatLAK(order.balance_due_lak)}
🔗 ລິ້ງບິນ: ${trackingUrl}
━━━━━━━━━━━━━━━━━━━━`;
}
