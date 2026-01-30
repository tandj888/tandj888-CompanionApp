<template>
	<view class="container">
		<!-- 未加入陪团状态 -->
		<view v-if="!hasGroup" class="no-group">
			<image class="illustration" src="/static/images/empty_group.png" mode="aspectFit"></image>
			<text class="tip">还没有加入小陪团哦</text>
			<text class="sub-tip">快去创建一个，邀请好友一起打卡吧</text>
			<button type="primary" class="create-btn" @tap="createGroup">创建小陪团</button>
		</view>

		<!-- 已加入陪团状态 -->
		<view v-else class="group-content">
			<!-- 陪团头部信息 -->
			<view class="group-header">
				<view class="header-top">
					<text class="group-name">{{ groupInfo.name }}</text>
					<text class="member-count">{{ groupInfo.memberCount }}/3人</text>
				</view>
				<text class="group-desc">{{ groupInfo.description || '暂无描述' }}</text>
			</view>

			<!-- 成员列表 -->
			<view class="member-list">
				<view class="member-item" v-for="(item, index) in memberList" :key="index">
					<view class="avatar-box">
						<image class="avatar" :src="item.avatar" mode="aspectFill"></image>
						<view class="status-badge" :class="{ 'done': item.hasClockedIn }">
							{{ item.hasClockedIn ? '已打卡' : '未打卡' }}
						</view>
					</view>
					<text class="nickname">{{ item.nickname }}</text>
					<text class="level">Lv.{{ item.level }}</text>
					
					<!-- 点赞互动 -->
					<view class="action-box" v-if="item.hasClockedIn && item.id !== currentUserId">
						<button class="like-btn" :class="{ 'liked': item.hasLiked }" @tap="toggleLike(item)">
							{{ item.hasLiked ? '已点赞' : '👍 点赞' }}
						</button>
					</view>
				</view>
				
				<!-- 邀请占位符 -->
				<view class="member-item invite-item" v-if="memberList.length < 3" @tap="inviteMember">
					<view class="avatar-box invite-box">
						<text class="plus">+</text>
					</view>
					<text class="nickname">邀请成员</text>
				</view>
			</view>

			<!-- 团内统计 -->
			<view class="stats-card">
				<view class="stat-item">
					<text class="num">{{ todayClockInCount }}</text>
					<text class="label">今日打卡</text>
				</view>
				<view class="divider"></view>
				<view class="stat-item">
					<text class="num">{{ maxContinuousDays }}</text>
					<text class="label">全团连续天数</text>
				</view>
			</view>
			
			<!-- 团长管理入口 -->
			<view class="manage-entry" v-if="isLeader" @tap="openSettings">
				<text>⚙️ 陪团设置</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentUserId: 'user_001', // 模拟当前用户ID
				hasGroup: true, // 模拟是否加入陪团
				isLeader: true, // 模拟是否为团长
				groupInfo: {
					name: '早起打卡小分队',
					description: '每天早上8点前打卡，不见不散！',
					memberCount: 2
				},
				memberList: [
					{
						id: 'user_001',
						nickname: '我',
						avatar: '/static/logo.png', // 暂时使用logo
						level: 2,
						hasClockedIn: true,
						hasLiked: false
					},
					{
						id: 'user_002',
						nickname: '小陪',
						avatar: '/static/logo.png',
						level: 1,
						hasClockedIn: false,
						hasLiked: false
					}
				]
			}
		},
		computed: {
			todayClockInCount() {
				return this.memberList.filter(m => m.hasClockedIn).length;
			},
			maxContinuousDays() {
				return 5; // 模拟数据
			}
		},
		methods: {
			createGroup() {
				uni.showToast({ title: '创建功能开发中', icon: 'none' });
			},
			inviteMember() {
				uni.showToast({ title: '链接已复制，去分享吧', icon: 'none' });
			},
			toggleLike(item) {
				item.hasLiked = !item.hasLiked;
				uni.showToast({ 
					title: item.hasLiked ? '点赞成功' : '取消点赞', 
					icon: 'none' 
				});
			},
			openSettings() {
				uni.showToast({ title: '设置功能开发中', icon: 'none' });
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

	.no-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 200rpx;

		.illustration {
			width: 300rpx;
			height: 300rpx;
			margin-bottom: 40rpx;
		}

		.tip {
			font-size: 34rpx;
			color: #333;
			font-weight: bold;
			margin-bottom: 16rpx;
		}

		.sub-tip {
			font-size: 26rpx;
			color: #999;
			margin-bottom: 60rpx;
		}

		.create-btn {
			width: 400rpx;
			border-radius: 50rpx;
			background-color: #6B8AFF;
		}
	}

	.group-content {
		.group-header {
			background-color: #fff;
			padding: 40rpx;
			border-radius: 20rpx;
			margin-bottom: 30rpx;
			box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);

			.header-top {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;

				.group-name {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
				}

				.member-count {
					font-size: 24rpx;
					color: #6B8AFF;
					background-color: rgba(107, 138, 255, 0.1);
					padding: 6rpx 16rpx;
					border-radius: 20rpx;
				}
			}

			.group-desc {
				font-size: 26rpx;
				color: #666;
				line-height: 1.5;
			}
		}

		.member-list {
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
			margin-bottom: 30rpx;
			
			.member-item {
				width: 32%;
				background-color: #fff;
				border-radius: 20rpx;
				padding: 30rpx 10rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				box-sizing: border-box;
				margin-bottom: 20rpx;
				
				.avatar-box {
					position: relative;
					margin-bottom: 20rpx;
					
					.avatar {
						width: 100rpx;
						height: 100rpx;
						border-radius: 50%;
						border: 2rpx solid #f0f0f0;
					}
					
					.status-badge {
						position: absolute;
						bottom: -10rpx;
						left: 50%;
						transform: translateX(-50%);
						font-size: 20rpx;
						color: #999;
						background-color: #eee;
						padding: 4rpx 12rpx;
						border-radius: 10rpx;
						white-space: nowrap;
						
						&.done {
							background-color: #4CD964;
							color: #fff;
						}
					}
					
					&.invite-box {
						width: 100rpx;
						height: 100rpx;
						background-color: #f8f8f8;
						border-radius: 50%;
						border: 2rpx dashed #ccc;
						display: flex;
						align-items: center;
						justify-content: center;
						
						.plus {
							font-size: 50rpx;
							color: #ccc;
							margin-top: -10rpx;
						}
					}
				}
				
				.nickname {
					font-size: 26rpx;
					color: #333;
					margin-bottom: 6rpx;
					max-width: 100%;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				
				.level {
					font-size: 20rpx;
					color: #e6b800;
					margin-bottom: 16rpx;
				}
				
				.like-btn {
					font-size: 20rpx;
					padding: 0 20rpx;
					height: 40rpx;
					line-height: 40rpx;
					background-color: #fff;
					color: #666;
					border: 1rpx solid #ddd;
					
					&.liked {
						color: #FF6B6B;
						border-color: #FF6B6B;
						background-color: rgba(255, 107, 107, 0.05);
					}
				}
			}
		}
		
		.stats-card {
			background-color: #fff;
			border-radius: 20rpx;
			padding: 30rpx;
			display: flex;
			align-items: center;
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
					margin-bottom: 8rpx;
				}
				
				.label {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.divider {
				width: 2rpx;
				height: 60rpx;
				background-color: #eee;
			}
		}
		
		.manage-entry {
			text-align: center;
			padding: 20rpx;
			
			text {
				font-size: 26rpx;
				color: #999;
			}
		}
	}
</style>
