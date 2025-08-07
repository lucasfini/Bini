// src/components/EmojiTray.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import Tray from './Tray';
import { colors } from '../styles';
import { useTheme } from '../context/ThemeContext';

interface EmojiTrayProps {
  visible: boolean;
  onClose: () => void;
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
}

// Emoji categories with proper names and icons
const EMOJI_CATEGORIES = [
  {
    id: 'recent',
    name: 'Recent',
    icon: '🕒',
    emojis: [], // Will be populated with recently used emojis
  },
  {
    id: 'smileys',
    name: 'SMILEYS & PEOPLE',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
      '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
      '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
      '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
      '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
      '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
      '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
      '😞', '😓', '😩', '😫', '😤', '😡', '😠', '🤬', '😈', '👿',
      '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
      '🎭', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕',
      '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓',
      '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇',
      '🤦', '🤷', '👮', '🕵️', '💂', '👷', '🤴', '👸', '👳', '👲',
      '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹',
      '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶',
      '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤺', '🏇', '⛷️',
      '🏂', '🏌️', '🏄', '🚣', '🏊', '⛹️', '🏋️', '🚴', '🚵', '🤸',
      '🤼', '🤽', '🤾', '🤹', '🧘', '🛀', '🛌', '👭', '👫', '👬',
    ],
  },
  {
    id: 'animals',
    name: 'ANIMALS & NATURE',
    icon: '🐾',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
      '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
      '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
      '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕',
      '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
      '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛',
      '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖',
      '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈',
      '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨',
      '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲',
      '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍',
      '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹',
      '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚',
      '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '⭐',
      '🌟', '💫', '⚡', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️',
      '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️',
      '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫️',
    ],
  },
  {
    id: 'food',
    name: 'FOOD & DRINK',
    icon: '🍎',
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
      '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞',
      '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩',
      '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆',
      '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣',
      '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮',
      '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮',
      '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛',
      '🍼', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷',
      '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽️',
    ],
  },
  {
    id: 'activities',
    name: 'SPORTS & ACTIVITIES',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🤿',
      '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂',
      '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄',
      '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉',
      '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🥁',
      '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♠️', '♥️', '♦️', '♣️',
      '♟️', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶',
      '🪢', '🎯', '🎳', '🎮', '🕹️', '🎰', '🧩', '🧸', '🪅', '🪆',
    ],
  },
  {
    id: 'objects',
    name: 'OBJECTS',
    icon: '💡',
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️',
      '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏰',
      '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '💰',
      '💸', '💵', '💴', '💶', '💷', '🪙', '💳', '💎', '⚖️', '🔧',
    ],
  },
  {
    id: 'symbols',
    name: 'SYMBOLS',
    icon: '♪',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
      '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑',
      '♒', '♓', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '♪', '%',
    ],
  },
  {
    id: 'flags',
    name: 'FLAGS',
    icon: '🏁',
    emojis: [
      '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇸', '🇬🇧',
      '🇨🇦', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇧🇷',
      '🇷🇺', '🇦🇺', '🇲🇽', '🇳🇱', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇨🇭', '🇦🇹',
      '🇧🇪', '🇵🇹', '🇬🇷', '🇹🇷', '🇮🇱', '🇪🇬', '🇸🇦', '🇦🇪', '🇮🇷', '🇮🇶',
      '🇿🇦', '🇳🇬', '🇰🇪', '🇲🇦', '🇱🇾', '🇪🇹', '🇬🇭', '🇨🇮', '🇨🇲', '🇸🇳',
    ],
  },
];

const EmojiTray: React.FC<EmojiTrayProps> = ({
  visible,
  onClose,
  selectedEmoji,
  onEmojiSelect,
}) => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('smileys');
  const flatListRef = useRef<FlatList>(null);

  const currentCategory = EMOJI_CATEGORIES.find(cat => cat.id === activeCategory);
  const currentEmojis = currentCategory?.emojis || [];

  const handleEmojiPress = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose(); // Close tray after selection
  };

  const handleCategoryPress = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Scroll to top when category changes
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderEmoji = ({ item }: { item: string }) => {
    const isSelected = item === selectedEmoji;

    return (
      <TouchableOpacity
        style={[
          styles.emojiButton,
          isSelected && { backgroundColor: theme.primary + '20' }
        ]}
        onPress={() => handleEmojiPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.emojiText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryIcon = (category: any, index: number) => {
    const isActive = category.id === activeCategory;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryIcon,
          isActive && { backgroundColor: theme.primary + '15' }
        ]}
        onPress={() => handleCategoryPress(category.id)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.categoryIconText,
          { color: isActive ? theme.primary : colors.textSecondary }
        ]}>
          {category.icon}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Tray
      visible={visible}
      onClose={onClose}
      title={currentCategory?.name || 'EMOJIS'}
      height="tall"
    >
      <View style={styles.container}>
        {/* Emoji Grid with Scroll Indicator */}
        <View style={styles.emojiSection}>
          <FlatList
            ref={flatListRef}
            data={currentEmojis}
            numColumns={8}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderEmoji}
            contentContainerStyle={styles.emojiGrid}
            showsVerticalScrollIndicator={true}
            style={styles.emojiList}
            indicatorStyle="default"
          />
        </View>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, { borderTopColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navIcons}
          >
            {EMOJI_CATEGORIES.map((category, index) => 
              renderCategoryIcon(category, index)
            )}
            
            {/* More arrow */}
            <TouchableOpacity style={styles.categoryIcon}>
              <Text style={[styles.categoryIconText, { color: colors.textSecondary }]}>
                »
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Tray>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  emojiSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emojiList: {
    flex: 1,
  },
  emojiGrid: {
    paddingBottom: 20,
  },
  emojiButton: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 0.5,
    marginVertical: 2,
    maxWidth: '12.5%', // 8 columns
  },
  emojiText: {
    fontSize: Platform.select({
      ios: 24,
      android: 22, // Android emojis tend to be slightly larger
    }),
    fontFamily: Platform.select({
      ios: 'System', // Use system font on iOS for native emojis
      android: 'normal', // Default Android font for native emojis
    }),
    includeFontPadding: false, // Android only - removes extra padding
    textAlignVertical: 'center', // Android only - centers emojis better
  },
  bottomNav: {
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryIconText: {
    fontSize: Platform.select({
      ios: 18,
      android: 16,
    }),
    fontFamily: Platform.select({
      ios: 'System',
      android: 'normal',
    }),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default EmojiTray;
