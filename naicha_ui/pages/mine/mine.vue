<template>
	<view class="container">
		<!-- 用户信息头部 -->
		<view class="user-header">
			<view class="avatar-box" @tap="editInfo">
				<image class="avatar" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
			</view>
			<view class="info-box">
				<view class="name-row">
					<text class="nickname">{{ userInfo.nickname || '点击登录' }}</text>
					<view class="level-badge" v-if="userInfo.nickname">
						<text>Lv.{{ userInfo.level || 1 }}</text>
					</view>
				</view>
				<view class="star-row" v-if="userInfo.nickname">
					<text>✨ 陪伴星: {{ userInfo.stars || 0 }}</text>
				</view>
			</view>
		</view>

		<!-- 统计卡片 -->
		<view class="stats-card">
			<view class="stat-item">
				<text class="num">{{ stats.totalDays || 0 }}</text>
				<text class="label">累计打卡</text>
			</view>
			<view class="stat-item">
				<text class="num">{{ stats.streakDays || 0 }}</text>
				<text class="label">连续天数</text>
			</view>
			<view class="stat-item">
				<text class="num">{{ stats.badges || 0 }}</text>
				<text class="label">解锁勋章</text>
			</view>
		</view>

		<!-- 菜单列表 -->
		<view class="menu-list">
			<view class="menu-item" @tap="navTo('profile')">
				<text class="title">个人信息</text>
				<text class="arrow">></text>
			</view>
			<view class="menu-item" @tap="navTo('privacy')">
				<text class="title">隐私设置</text>
				<text class="arrow">></text>
			</view>
			<view class="menu-item" @tap="handleLogout">
				<text class="title">退出登录</text>
				<text class="arrow">></text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {
					nickname: '小陪体验官',
					avatar: '',
					level: 2,
					stars: 12
				},
				stats: {
					totalDays: 45,
					streakDays: 3,
					badges: 4
				}
			}
		},
		methods: {
			editInfo() {
				uni.showToast({ title: '修改头像功能开发中', icon: 'none' });
			},
			navTo(page) {
				uni.showToast({ title: '功能开发中', icon: 'none' });
			},
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.userInfo = {};
							uni.showToast({ title: '已退出', icon: 'none' });
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background-color: #F8F8F8;
		padding: 30rpx;
	}
	
	.user-header {
		background-color: #fff;
		padding: 40rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		
		.avatar-box {
			margin-right: 30rpx;
			
			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				background-color: #eee;
			}
		}
		
		.info-box {
			flex: 1;
			
			.name-row {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;
				
				.nickname {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
					margin-right: 16rpx;
				}
				
				.level-badge {
					background-color: #FFF9C4;
					color: #FBC02D;
					font-size: 20rpx;
					padding: 4rpx 12rpx;
					border-radius: 10rpx;
				}
			}
			
			.star-row {
				font-size: 24rpx;
				color: #666;
			}
		}
	}
	
	.stats-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 40rpx 0;
		display: flex;
		justify-content: space-around;
		margin-bottom: 30rpx;
		
		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.num {
				font-size: 40rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
			}
			
			.label {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
	
	.menu-list {
		background-color: #fff;
		border-radius: 20rpx;
		
		.menu-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx 40rpx;
			border-bottom: 1rpx solid #f5f5f5;
			
			&:last-child {
				border-bottom: none;
			}
			
			.title {
				font-size: 30rpx;
				color: #333;
			}
			
			.arrow {
				color: #ccc;
			}
		}
	}
</style>
