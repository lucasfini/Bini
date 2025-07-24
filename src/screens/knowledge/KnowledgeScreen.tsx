// src/screens/knowledge/KnowledgeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Animated,
  Linking,
} from 'react-native';

// Import your existing colors from styles
import { colors, typography, spacing, shadows } from '../../styles';

interface KnowledgeEntry {
  id: string;
  type: 'quote' | 'link' | 'photo' | 'video' | 'note';
  title?: string;
  content: string;
  url?: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  source?: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  isFavorite: boolean;
}

const KnowledgeScreen: React.FC = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([
    {
      id: '1',
      type: 'quote',
      content: "The only way to do great work is to love what you do.",
      author: 'Steve Jobs',
      source: 'Stanford Commencement Speech',
      tags: ['motivation', 'work'],
      createdBy: 'Alex',
      createdAt: new Date(),
      reactions: [{ emoji: '💡', count: 2, users: ['Alex', 'Blake'] }],
      isFavorite: true,
    },
    {
      id: '2',
      type: 'link',
      title: 'The Science of Habit Formation',
      content: 'Great article about building lasting habits',
      url: 'https://example.com/habits',
      imageUrl: 'https://via.placeholder.com/300x200/4CAF50/white?text=Habits',
      tags: ['habits', 'psychology'],
      createdBy: 'Blake',
      createdAt: new Date(),
      reactions: [{ emoji: '🧠', count: 1, users: ['Alex'] }],
      isFavorite: false,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    type: 'note' as const,
    title: '',
    content: '',
    url: '',
    author: '',
    source: '',
    tags: [] as string[],
  });

  const KnowledgeCard: React.FC<{ entry: KnowledgeEntry }> = ({ entry }) => {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setSelectedEntry(entry);
    };

    const handleLinkPress = () => {
      if (entry.url) {
        Linking.openURL(entry.url);
      }
    };

    const getTypeIcon = () => {
      switch (entry.type) {
        case 'quote': return '💬';
        case 'link': return '🔗';
        case 'photo': return '📷';
        case 'video': return '🎥';
        default: return '📝';
      }
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.knowledgeCard,
            entry.isFavorite && styles.knowledgeCardFavorite
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {/* Card Header */}
          <View style={styles.knowledgeCardHeader}>
            <View style={styles.knowledgeTypeIndicator}>
              <Text style={styles.knowledgeTypeIcon}>
                {getTypeIcon()}
              </Text>
            </View>
            <View style={styles.knowledgeMetadata}>
              <Text style={styles.knowledgeAuthor}>
                by {entry.createdBy}
              </Text>
              <Text style={styles.knowledgeDate}>
                {entry.createdAt.toLocaleDateString()}
              </Text>
            </View>
            {entry.isFavorite && (
              <Text style={styles.favoriteIcon}>⭐</Text>
            )}
          </View>

          {/* Card Content */}
          {entry.imageUrl && (
            <Image 
              source={{ uri: entry.imageUrl }} 
              style={styles.knowledgeImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.knowledgeContent}>
            {entry.title && (
              <Text style={styles.knowledgeTitle}>{entry.title}</Text>
            )}
            <Text style={styles.knowledgeText} numberOfLines={3}>
              {entry.content}
            </Text>
            {entry.author && entry.source && (
              <Text style={styles.knowledgeSource}>
                — {entry.author}, {entry.source}
              </Text>
            )}
          </View>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <View style={styles.knowledgeTags}>
              {entry.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.knowledgeTag}>
                  <Text style={styles.knowledgeTagText}>{tag}</Text>
                </View>
              ))}
              {entry.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{entry.tags.length - 3}</Text>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.knowledgeActions}>
            {entry.type === 'link' && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleLinkPress}
              >
                <Text style={styles.linkButtonText}>Open Link</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.knowledgeReactions}>
              {entry.reactions.map((reaction, index) => (
                <View key={index} style={styles.reactionBadge}>
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.reactionCount}>{reaction.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const CreateEntryModal = () => (
    <Modal visible={showCreateModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.createModalContent}>
          <View style={styles.createModalHeader}>
            <Text style={styles.createModalTitle}>Add Knowledge</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.createModalBody}>
            {/* Type Selection */}
            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.typeSelector}>
              {(['note', 'quote', 'link', 'photo'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newEntry.type === type && styles.typeOptionSelected
                  ]}
                  onPress={() => setNewEntry(prev => ({ ...prev, type }))}
                >
                  <Text style={styles.typeOptionText}>
                    {type === 'note' ? '📝' : 
                     type === 'quote' ? '💬' : 
                     type === 'link' ? '🔗' : '📷'}
                  </Text>
                  <Text style={styles.typeLabel}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content Input */}
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              placeholder={
                newEntry.type === 'quote' ? 'Enter the quote...' :
                newEntry.type === 'link' ? 'Why is this link useful?' :
                'Share your thoughts...'
              }
              value={newEntry.content}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, content: text }))}
              multiline
              numberOfLines={4}
            />

            {/* Conditional Fields */}
            {newEntry.type === 'quote' && (
              <>
                <Text style={styles.inputLabel}>Author</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Who said this?"
                  value={newEntry.author}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, author: text }))}
                />
                
                <Text style={styles.inputLabel}>Source</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Book title, speech, etc."
                  value={newEntry.source}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, source: text }))}
                />
              </>
            )}

            {newEntry.type === 'link' && (
              <>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Link title"
                  value={newEntry.title}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, title: text }))}
                />
                
                <Text style={styles.inputLabel}>URL</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://..."
                  value={newEntry.url}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, url: text }))}
                  keyboardType="url"
                />
              </>
            )}

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                if (!newEntry.content.trim()) {
                  Alert.alert('Missing Content', 'Please add some content');
                  return;
                }

                const entry: KnowledgeEntry = {
                  id: Date.now().toString(),
                  type: newEntry.type,
                  title: newEntry.title || undefined,
                  content: newEntry.content,
                  url: newEntry.url || undefined,
                  author: newEntry.author || undefined,
                  source: newEntry.source || undefined,
                  tags: [], // You could add a tag input here
                  createdBy: 'Alex', // Current user
                  createdAt: new Date(),
                  reactions: [],
                  isFavorite: false,
                };

                setEntries(prev => [entry, ...prev]);
                setShowCreateModal(false);
                setNewEntry({
                  type: 'note',
                  title: '',
                  content: '',
                  url: '',
                  author: '',
                  source: '',
                  tags: [],
                });
              }}
            >
              <Text style={styles.createButtonText}>Add Knowledge ✨</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.knowledgeHeader}>
        <View>
          <Text style={styles.knowledgeHeaderTitle}>Knowledge</Text>
          <Text style={styles.knowledgeHeaderSubtitle}>
            Shared wisdom & inspiration
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Knowledge Feed */}
      <ScrollView style={styles.knowledgeFeed} showsVerticalScrollIndicator={false}>
        {entries.map((entry) => (
          <KnowledgeCard key={entry.id} entry={entry} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <CreateEntryModal />

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <Modal visible={!!selectedEntry} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedEntry(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              
              {selectedEntry.imageUrl && (
                <Image 
                  source={{ uri: selectedEntry.imageUrl }} 
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}
              
              <ScrollView style={styles.modalBody}>
                {selectedEntry.title && (
                  <Text style={styles.modalTitle}>{selectedEntry.title}</Text>
                )}
                <Text style={styles.modalText}>{selectedEntry.content}</Text>
                {selectedEntry.author && selectedEntry.source && (
                  <Text style={styles.modalSource}>
                    — {selectedEntry.author}, {selectedEntry.source}
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  knowledgeHeaderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  knowledgeHeaderSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  knowledgeFeed: {
    flex: 1,
    padding: 16,
  },
  knowledgeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  knowledgeCardFavorite: {
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  knowledgeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  knowledgeTypeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knowledgeTypeIcon: {
    fontSize: 16,
  },
  knowledgeMetadata: {
    flex: 1,
  },
  knowledgeAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  knowledgeDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  knowledgeImage: {
    width: '100%',
    height: 200,
  },
  knowledgeContent: {
    padding: 16,
  },
  knowledgeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  knowledgeText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  knowledgeSource: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  knowledgeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    alignItems: 'center',
  },
  knowledgeTag: {
    backgroundColor: colors.accentSecondary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  knowledgeTagText: {
    fontSize: 12,
    color: colors.accentSecondary,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  knowledgeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  linkButton: {
    backgroundColor: colors.accentSecondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
  },
  knowledgeReactions: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalSource: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'right',
  },

  // Create Modal Styles
  createModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  createModalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  typeOptionText: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  createButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default KnowledgeScreen;