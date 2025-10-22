import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';

interface AvatarProps {
  seed: string; // User ID or name to generate consistent avatar
  size?: number;
  style?: any;
}

const Avatar: React.FC<AvatarProps> = ({ seed, size = 32, style }) => {
  // Generate avatar SVG with lorelei style
  const avatar = createAvatar(lorelei, {
    seed,
    size,
  });

  const svgString = avatar.toString();

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <SvgXml xml={svgString} width={size} height={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    backgroundColor: '#2A2A2A',
  },
});

export default Avatar;
