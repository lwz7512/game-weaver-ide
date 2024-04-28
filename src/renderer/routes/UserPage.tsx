import clsx from 'clsx';
import { Layout } from './Layout';
import { ROUTES, badgeImages } from '../config';
import { getUserScore } from '../state/storage';

const UserPage = () => {
  const userScore = getUserScore();
  return (
    <Layout pageName="user" modulePath={ROUTES.USER}>
      <div className="flex-1 w-full">
        <h1 className="text-2xl text-center p-8 border-b-2 font-semibold text-white bg-slate-800">
          Welcome to Achivement Center!
        </h1>
        <div className="badges h-5/6 p-8 overflow-y-scroll grid grid-cols-3 w-full gap-6">
          {/* Challenge Achievement - Bravery Badge */}
          <div className="achivement-row my-4 bg-white p-2 rounded-lg ">
            <h2
              className="px-4 text-xl py-1 border-b-2 border-green-500 bg-green-50 select-none"
              title="Complete 1 challenge required to unlock this badge!"
            >
              Challenge Achievement - 1 - Bravery Badge: 💡
            </h2>
            <div className="px-4 py-8 flex justify-center">
              <img
                src={badgeImages.bravery.url}
                className={clsx(
                  'w-36 h-36',
                  userScore < badgeImages.bravery.score ? 'opacity-30' : ''
                )}
                alt="bravery badge"
              />
            </div>
          </div>
          {/* Challenge Achievement - Beginner Badge */}
          <div className="achivement-row my-4  bg-white p-2 rounded-lg ">
            <h2
              className="px-4 text-xl py-1 border-b-2 border-green-500 bg-green-50 select-none"
              title="Complete 10 challenge required to unlock this badge!"
            >
              Challenge Achievement - 2 - Beginner Badge: 💡
            </h2>
            <div className="px-4 py-8 flex justify-center">
              <img
                src={badgeImages.beginner.url}
                className={clsx(
                  'w-36 h-36',
                  userScore < badgeImages.beginner.score ? 'opacity-30' : ''
                )}
                alt="bravery badge"
              />
            </div>
          </div>
          {/* Challenge Achievement - Junior Badge */}
          <div className="achivement-row my-4 bg-white p-2 rounded-lg ">
            <h2
              className="px-4 text-xl py-1 border-b-2 border-green-500 bg-green-50 select-none"
              title="Complete 30 challenge required to unlock this badge!"
            >
              Challenge Achievement - 3 - Junior Badge: 💡
            </h2>
            <div className="px-4 py-8 flex justify-center">
              <img
                src={badgeImages.junior.url}
                className={clsx(
                  'w-36 h-36',
                  userScore < badgeImages.junior.score ? 'opacity-30' : ''
                )}
                alt="junior badge"
              />
            </div>
          </div>
          {/* Challenge Achievement - Master Badge */}
          <div className="achivement-row my-4 bg-white p-2 rounded-lg ">
            <h2
              className="px-4 text-xl py-1 border-b-2 border-green-500 bg-green-50 select-none"
              title="Complete 60 challenge required to unlock this badge!"
            >
              Challenge Achievement - 4 - Master Badge: 💡
            </h2>
            <div className="px-4 py-8 flex justify-center">
              <img
                src={badgeImages.master.url}
                className={clsx(
                  'w-36 h-36',
                  userScore < badgeImages.master.score ? 'opacity-30' : ''
                )}
                alt="master badge"
              />
            </div>
          </div>
          {/* Challenge Achievement - Graduation Badge */}
          <div className="achivement-row my-4 bg-white p-2 rounded-lg ">
            <h2
              className="px-4 text-xl py-1 border-b-2 border-green-500 bg-green-50 select-none"
              title="Complete 100 challenge required to unlock this badge!"
            >
              Challenge Achievement - 5 - Graduation Badge: 💡
            </h2>
            <div className="px-4 py-8 flex justify-center">
              <img
                src={badgeImages.graduation.url}
                className={clsx(
                  'w-36 h-36',
                  userScore < badgeImages.graduation.score ? 'opacity-30' : ''
                )}
                alt="graduation badge"
              />
            </div>
          </div>
          {/* end of badges */}
        </div>
      </div>
    </Layout>
  );
};

export default UserPage;
