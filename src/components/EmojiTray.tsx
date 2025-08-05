// src/components/EmojiTray.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Search } from '@tamagui/lucide-icons';
import Tray from './Tray';

interface EmojiTrayProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  isDarkMode?: boolean;
}

// Comprehensive emoji dataset organized by categories
const EMOJI_DATA = {
  'Smileys & People': [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '🤣',
    '😂',
    '🙂',
    '🙃',
    '😉',
    '😊',
    '😇',
    '🥰',
    '😍',
    '🤩',
    '😘',
    '😗',
    '☺️',
    '😚',
    '😙',
    '😋',
    '😛',
    '😜',
    '🤪',
    '😝',
    '🤑',
    '🤗',
    '🤭',
    '🤫',
    '🤔',
    '🤐',
    '🤨',
    '😐',
    '😑',
    '😶',
    '😏',
    '😒',
    '🙄',
    '😬',
    '🤥',
    '😔',
    '😪',
    '🤤',
    '😴',
    '😷',
    '🤒',
    '🤕',
    '🤢',
    '🤮',
  ],
  'Animals & Nature': [
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🐯',
    '🦁',
    '🐮',
    '🐷',
    '🐽',
    '🐸',
    '🐵',
    '🙈',
    '🙉',
    '🙊',
    '🐒',
    '🐔',
    '🐧',
    '🐦',
    '🐤',
    '🐣',
    '🐥',
    '🦆',
    '🦅',
    '🦉',
    '🦇',
    '🐺',
    '🐗',
    '🐴',
    '🦄',
    '🐝',
    '🐛',
    '🦋',
    '🐌',
    '🐞',
    '🐜',
    '🦟',
    '🦗',
    '🕷️',
    '🕸️',
    '🦂',
    '🐢',
    '🐍',
    '🦎',
    '🦖',
    '🦕',
  ],
  'Food & Drink': [
    '🍎',
    '🍐',
    '🍊',
    '🍋',
    '🍌',
    '🍉',
    '🍇',
    '🍓',
    '🍈',
    '🍒',
    '🍑',
    '🥭',
    '🍍',
    '🥥',
    '🥝',
    '🍅',
    '🍆',
    '🥑',
    '🥦',
    '🥬',
    '🥒',
    '🌶️',
    '🌽',
    '🥕',
    '🥔',
    '🍠',
    '🥐',
    '🍞',
    '🥖',
    '🥨',
    '🧀',
    '🥚',
    '🍳',
    '🥞',
    '🥓',
    '🥩',
    '🍗',
    '🍖',
    '🌭',
    '🍔',
    '🍟',
    '🍕',
    '🥪',
    '🥙',
    '🌮',
    '🌯',
    '🥗',
    '🥘',
    '🍝',
    '🍜',
  ],
  Activities: [
    '⚽',
    '🏀',
    '🏈',
    '⚾',
    '🥎',
    '🎾',
    '🏐',
    '🏉',
    '🥏',
    '🎱',
    '🪀',
    '🏓',
    '🏸',
    '🏒',
    '🏑',
    '🥍',
    '🏏',
    '⛳',
    '🪁',
    '🏹',
    '🎣',
    '🤿',
    '🥊',
    '🥋',
    '🎽',
    '🛹',
    '🛷',
    '⛸️',
    '🥌',
    '🎿',
    '⛷️',
    '🏂',
    '🪂',
    '🏋️',
    '🤼',
    '🤸',
    '⛹️',
    '🤺',
    '🤾',
    '🏌️',
    '🏇',
    '🧘',
    '🏄',
    '🏊',
    '🤽',
    '🚣',
    '🧗',
    '🚵',
    '🚴',
    '🏆',
  ],
  Objects: [
    '⌚',
    '📱',
    '📲',
    '💻',
    '⌨️',
    '🖥️',
    '🖨️',
    '🖱️',
    '🖲️',
    '🕹️',
    '🗜️',
    '💽',
    '💾',
    '💿',
    '📀',
    '📼',
    '📷',
    '📸',
    '📹',
    '🎥',
    '📽️',
    '🎞️',
    '📞',
    '☎️',
    '📟',
    '📠',
    '📺',
    '📻',
    '🎙️',
    '🎚️',
    '🎛️',
    '⏰',
    '🕰️',
    '⌛',
    '⏳',
    '📡',
    '🔋',
    '🔌',
    '💡',
    '🔦',
    '🕯️',
    '🪔',
    '🧯',
    '🛢️',
    '💸',
    '💵',
    '💴',
    '💶',
    '💷',
    '💰',
  ],
  Symbols: [
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💔',
    '❣️',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
    '💟',
    '☮️',
    '✝️',
    '☪️',
    '🕉️',
    '☸️',
    '✡️',
    '🔯',
    '🕎',
    '☯️',
    '☦️',
    '🛐',
    '⛎',
    '♈',
    '♉',
    '♊',
    '♋',
    '♌',
    '♍',
    '♎',
    '♏',
    '♐',
    '♑',
    '♒',
    '♓',
    '🆔',
    '⚛️',
    '🉑',
    '☢️',
    '☣️',
    '📴',
    '📳',
  ],
};

const EmojiTray: React.FC<EmojiTrayProps> = ({
  visible,
  onClose,
  onBack,
  selectedEmoji,
  onEmojiSelect,
  isDarkMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Smileys & People');

  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    searchBackground: isDarkMode ? '#374151' : '#F3F4F6',
    categoryActive: '#4A7C3A',
    categoryInactive: isDarkMode ? '#4B5563' : '#E5E7EB',
  };

  const categories = Object.keys(EMOJI_DATA);

  // Filter emojis based on search query
  const getFilteredEmojis = () => {
    if (searchQuery.trim() === '') {
      return EMOJI_DATA[selectedCategory as keyof typeof EMOJI_DATA] || [];
    }

    // Search across all categories
    const allEmojis = Object.values(EMOJI_DATA).flat();
    return allEmojis.filter(
      emoji =>
        // This is a simple filter - in production you might want emoji names/keywords
        emoji.includes(searchQuery) ||
        (searchQuery.toLowerCase().includes('smile') &&
          emoji.match(/😀|😃|😄|😁|😊/)),
    );
  };

  const filteredEmojis = getFilteredEmojis();

  const handleEmojiPress = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  const handleDone = () => {
    onClose();
  };

  const renderEmoji = ({ item }: { item: string }) => {
    const isSelected = item === selectedEmoji;

    return (
      <TouchableOpacity
        style={[styles.emojiButton, isSelected && styles.emojiButtonSelected]}
        onPress={() => handleEmojiPress(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.emojiText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const renderCategory = (category: string) => {
    const isActive = category === selectedCategory;

    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.categoryButton,
          {
            backgroundColor: isActive
              ? theme.categoryActive
              : theme.categoryInactive,
          },
        ]}
        onPress={() => setSelectedCategory(category)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryText,
            {
              color: isActive ? '#FFFFFF' : theme.textSecondary,
            },
          ]}
          numberOfLines={1}
        >
          {category.split(' ')[0]} {/* Show first word only for space */}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Tray
      visible={visible}
      onClose={onClose}
      onBack={onBack}
      title="Choose Emoji"
      height="tall"
      isDarkMode={isDarkMode}
      leftButton={
        !onBack
          ? {
              text: 'Cancel',
              onPress: onClose,
            }
          : undefined
      }
      rightButton={{
        text: 'Done',
        onPress: handleDone,
      }}
    >
      <View style={styles.container}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.searchBackground },
          ]}
        >
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search emojis..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* Category Tabs */}
        {searchQuery.trim() === '' && (
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item}
              renderItem={({ item }) => renderCategory(item)}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Emoji Grid */}
        <FlatList
          data={filteredEmojis}
          numColumns={8}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderEmoji}
          contentContainerStyle={styles.emojiGrid}
          showsVerticalScrollIndicator={false}
          style={styles.emojiList}
        />
      </View>
    </Tray>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 4,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
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
    margin: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  emojiButtonSelected: {
    backgroundColor: '#E8F5E8',
  },
  emojiText: {
    fontSize: 24,
  },
});

export default EmojiTray;
